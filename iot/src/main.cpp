#include <Arduino.h>
#include <WiFi.h>
#include <WiFiClientSecure.h> 
#include <PubSubClient.h>
#include <ArduinoJson.h>
#include <Wire.h>
#include <Adafruit_INA219.h>
#include <DHT.h>
#include <NTPClient.h>
#include <WiFiUdp.h>
#include <time.h>
#include "cert.h"

#include <mbedtls/md.h>

// --- 1. CẤU HÌNH THÔNG TIN MẠNG (ĐIỀN VÀO ĐÂY) ---
const char* ssid = WIFI_SSID;
const char* password = WIFI_PASS;
const char* mqtt_server = MQTT_SERVER; 
const char* mqtt_user = HIVEMQ_USERNAME;
const char* mqtt_pass = HIVEMQ_PASSWORD;
const int mqtt_port = atoi(MQTT_PORT); 
// Topic MQTT
const char* mqtt_topic_pub = MQTT_TOPIC_PUB; // Gửi dữ liệu lên
const char* mqtt_topic_sub = MQTT_TOPIC_SUB;  // Nhận lệnh về
const char* mqtt_topic_heartbeat = MQTT_TOPIC_HEARTBEAT; // Gửi tín hiệu sống
const char *mqtt_topic_alert = MQTT_TOPIC_ALERT;

const char* DEVICE_ID = "ESP32_SMARTFARM_01";

const char* SECRET_KEY = MY_SECRET_KEY;


// --- 2. CẤU HÌNH CHÂN (TƯƠNG THÍCH ESP32 30 PIN) ---
#define DHTPIN 4        // D4
#define DHTTYPE DHT11
#define SOIL_PIN 34     // D34 (Chỉ Input - OK cho 30 pin)
#define TRIG_PIN 5      // D5
#define ECHO_PIN 18     // D18
#define RELAY_PIN 19    // D19

// Chân I2C mặc định cho INA219 trên ESP32 30 pin là: SDA (21), SCL (22)

// --- 3. CẤU HÌNH LOGIC TỰ ĐỘNG ---
#define RELAY_ON HIGH    // Relay kích mức thấp
#define RELAY_OFF LOW

enum SystemMode { MODE_MANUAL = 0, MODE_AUTO = 1, MODE_AI = 2 };
SystemMode currentMode = MODE_AUTO; // Mặc định khởi động là chạy Auto cục bộ

// CẤU HÌNH HEARTBEAT (TIM MẠCH)
unsigned long lastServerHeartbeat = 0;
const unsigned long SERVER_TIMEOUT = 60000;

int soilLowerLimit = 30; // Ngưỡng dưới: Dưới mức này thì tưới
int soilUpperLimit = 70;
const float MIN_WATER_LEVEL = 10.0; // Dưới 10% -> Cấm bơm
float heightTankWater = 100.0;      // Chiều cao bể (cm)

// Biến toàn cục
bool isAutoMode = true; // Mặc định chạy tự động
String pumpStatus = "OFF";
String warningMsg = "None";

int pumpMaxDuration = 10;   // Thời gian tưới tối đa (giây), mặc định 60s
unsigned long pumpStartTime = 0; // Lưu thời điểm bắt đầu bật bơm
bool isPumpRunning = false;

unsigned long lastMsg = 0;
#define MSG_INTERVAL 5000 

WiFiClientSecure espClient; 
PubSubClient client(espClient);
DHT dht(DHTPIN, DHTTYPE);
Adafruit_INA219 ina219;

WiFiUDP ntpUDP;
NTPClient timeClient(ntpUDP, "pool.ntp.org", 7 * 3600);

const char* ntpServer = "pool.ntp.org";
const long  gmtOffset_sec = 7 * 3600; // GMT+7 cho Việt Nam
const int   daylightOffset_sec = 0;

// === HÀM TẠO CHỮ KÝ SỐ (HMAC-SHA256) ===
// ============================================================
String hmac_sha256(String payload, const char* key) {
  byte hmacResult[32];
  mbedtls_md_context_t ctx;
  mbedtls_md_type_t md_type = MBEDTLS_MD_SHA256;
 
  const size_t keyLength = strlen(key);            
  const size_t payloadLength = payload.length();
 
  mbedtls_md_init(&ctx);
  mbedtls_md_setup(&ctx, mbedtls_md_info_from_type(md_type), 1);
  mbedtls_md_hmac_starts(&ctx, (const unsigned char *) key, keyLength);
  mbedtls_md_hmac_update(&ctx, (const unsigned char *) payload.c_str(), payloadLength);
  mbedtls_md_hmac_finish(&ctx, hmacResult);
  mbedtls_md_free(&ctx);
 
  String hashStr = "";
  for(int i=0; i<32; i++){
      if(hmacResult[i] < 16) hashStr += "0";
      hashStr += String(hmacResult[i], HEX);
  }
  return hashStr;
}
// ============================================================

// --- HÀM ĐO KHOẢNG CÁCH ---
float getDistance() {
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);
  long duration = pulseIn(ECHO_PIN, HIGH);
  if (duration == 0) return 999; 
  return duration * 0.034 / 2;
}

// --- HÀM ĐỌC PIN ---
float getBatteryPercent() {
  float busVoltage = ina219.getBusVoltage_V();
  float shuntVoltage = ina219.getShuntVoltage_mV() / 1000.0;
  float loadVoltage = busVoltage + shuntVoltage;
  // Giả sử pin 3S (12.6V đầy, 9V cạn)
  float percent = (loadVoltage - 9.0) / (12.6 - 9.0) * 100.0;
  return constrain(percent, 0.0, 100.0);
}

// --- HÀM LẤY THỜI GIAN ĐỊNH DẠNG NGÀY THÁNG ---
String getFullTimestamp() {
  struct tm timeinfo;
  if (!getLocalTime(&timeinfo)) {
    return "Time Error";
  }
  char timeStringBuff[25]; // Đủ chứa: 2025-12-29 16:37:32
  strftime(timeStringBuff, sizeof(timeStringBuff), "%Y-%m-%d %H:%M:%S", &timeinfo);
  return String(timeStringBuff);
}

// --- HÀM GỬI CẢNH BÁO (ALERT) ---
void sendAlert(String type, String message, float currentVal, float thresholdVal) {
  // Kiểm tra thời gian để tránh spam (chỉ gửi lại sau 60s nếu lỗi vẫn còn)
  // unsigned long now = millis();
  // if (now - lastAlertTime < ALERT_COOLDOWN) {
  //     return; 
  // }
  // lastAlertTime = now; 

  StaticJsonDocument<512> doc;
  
  doc["device_id"] = DEVICE_ID;
  doc["epoch"] = timeClient.getEpochTime(); // Chống Replay

  JsonObject alertObj = doc.createNestedObject("alert");
  alertObj["type"] = type;           
  alertObj["message"] = message;     
  alertObj["currentValue"] = currentVal;

  // Đặt tên key ngưỡng (threshold) linh hoạt theo loại cảnh báo
  if (type == "soilMoisture") {
      alertObj["soilMin"] = thresholdVal;
  } 
  else if (type == "water") {
      alertObj["minLevel"] = thresholdVal;
  }
  else if (type == "pumpTimeout") {
      alertObj["maxDuration"] = thresholdVal;
  }
  else {
      alertObj["limit"] = thresholdVal;
  }

  // Ký số
  // String rawJson;
  // serializeJson(doc, rawJson);
  // String signature = hmac_sha256(rawJson, SECRET_KEY);
  // doc["signature"] = signature;

  // Gửi sang topic Alert
  char buffer[512];
  serializeJson(doc, buffer);
  client.publish(mqtt_topic_alert, buffer);
  
  Serial.print("⚠️ ALERT SENT: ");
  Serial.println(buffer);
}

// --- HÀM DỪNG BƠM KHẨN CẤP/AN TOÀN ---
void stopPump(String reason) {
  digitalWrite(RELAY_PIN, RELAY_OFF);
  isPumpRunning = false;
  warningMsg = reason;
  pumpStatus = "OFF";
  Serial.println("-> Stop Pump: " + reason);
}


// --- HÀM CALLBACK (XỬ LÝ LỆNH TỪ MQTT) ---
void callback(char* topic, byte* payload, unsigned int length) {
  String topicStr = String(topic);
  String message;
  for (int i = 0; i < length; i++) message += (char)payload[i];
  if (topicStr == mqtt_topic_heartbeat) {
      lastServerHeartbeat = millis();
      Serial.println("❤️"); // Uncomment để debug nếu cần
      return; // <--- QUAN TRỌNG: Return ngay, không chạy tiếp code JSON bên dưới
  }
  
  Serial.print("Nhan lenh: "); Serial.println(message);

  StaticJsonDocument<512> doc;
  DeserializationError error = deserializeJson(doc, message);
  if (error) return;

  JsonObject data = doc["data"];

  // 1. Chuyển chế độ
  // 2. CHUYỂN CHẾ ĐỘ (MODE SWITCHING)
  if (data.containsKey("mode")) {
    const char* newModeStr = data["mode"];
    SystemMode nextMode = currentMode;

    if (strcmp(newModeStr, "auto") == 0) nextMode = MODE_AUTO;
    else if (strcmp(newModeStr, "manual") == 0) nextMode = MODE_MANUAL;
    else if (strcmp(newModeStr, "ai") == 0) {
        nextMode = MODE_AI;
        // Khi vừa chuyển sang AI, coi như vừa nhận heartbeat để không bị timeout ngay
        lastServerHeartbeat = millis(); 
    }

    if (nextMode != currentMode) {
      currentMode = nextMode;
      stopPump("Chuyển chế độ"); // An toàn: Dừng bơm khi chuyển logic
      Serial.printf("-> Chuyen sang che do: %s\n", newModeStr);
    }
  }
  // 2. Cập nhật ngưỡng (CHỈ KHI ĐANG Ở CHẾ ĐỘ AUTO)
  if (currentMode == MODE_AUTO) {
    bool updated = false;
    int tempLower = soilLowerLimit;
    int tempUpper = soilUpperLimit;

    if (data.containsKey("lower")) {
      tempLower = doc["lower"];
      updated = true;
    }
    if (data.containsKey("upper")) {
      tempUpper = doc["upper"];
      updated = true;
    }

    if (data.containsKey("duration")) {
        pumpMaxDuration = data["duration"];
        Serial.printf("-> Cap nhat thoi gian tuoi toi da: %d s\n", pumpMaxDuration);
    }

    // Kiểm tra logic: ngưỡng dưới phải nhỏ hơn ngưỡng trên
    if (updated) {
      if (tempLower < tempUpper) {
        soilLowerLimit = tempLower;
        soilUpperLimit = tempUpper;
        Serial.printf("-> Da cap nhat nguong moi: Low=%d, High=%d\n", soilLowerLimit, soilUpperLimit);
      } else {
        Serial.println("LỖI: Ngưỡng dưới phải nhỏ hơn ngưỡng trên!");
      }
    }
  } else {
    // Nếu đang ở Manual/AI mà gửi lệnh đổi ngưỡng
    if (data.containsKey("lower") || data.containsKey("upper")) {
      Serial.println("Tu choi: Phai chuyen sang AUTO moi co the doi nguong.");
    }
  }

  // 3. Bật tắt bơm (Chỉ Manual) - Giữ nguyên logic của bạn
  if ((currentMode == MODE_MANUAL || currentMode == MODE_AI) && data.containsKey("pump")) {
    const char* cmd = data["pump"];
    
    // Check nước
    float dist = getDistance();
    float level = (dist < heightTankWater) ? (1.0 - dist/heightTankWater)*100 : 0;
    
    if (level < MIN_WATER_LEVEL && strcmp(cmd, "on") == 0) {
       Serial.println("CANH BAO: Be can nuoc!");
    } else {
       if (strcmp(cmd, "on") == 0) {
          if (!isPumpRunning) {
              digitalWrite(RELAY_PIN, RELAY_ON);
              pumpStatus = (currentMode == MODE_AI) ? "ON" : "ON";
              isPumpRunning = true;
              pumpStartTime = millis(); 
              Serial.println("-> Bat bom (Remote Command)");
          }
       } else if (strcmp(cmd, "off") == 0) {
          stopPump("Lệnh tắt từ xa");
       }
    }
  }
}

// --- SETUP WIFI ---
void setup_wifi() {
  delay(10);
  Serial.println();
  Serial.print("Connecting to "); Serial.println(ssid);
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500); Serial.print(".");
  }
  Serial.println("\nWiFi Connected!");
  espClient.setInsecure(); // Bỏ qua check chứng chỉ SSL
  //espClient.setCACert(amazon_root_ca);
}

// --- RECONNECT MQTT ---
void reconnect() {
  while (!client.connected()) {
    Serial.print("Connecting MQTT...");
    String clientId = "ESP32-Client-" + String(random(0xffff), HEX);
    if (client.connect(clientId.c_str(), mqtt_user, mqtt_pass)) {
      Serial.println("CONNECTED");
      client.subscribe(mqtt_topic_sub); // Đăng ký nhận lệnh
      client.subscribe(mqtt_topic_heartbeat);
    } else {
      Serial.print("failed, rc="); Serial.print(client.state());
      delay(5000);
    }
  }
}

// --- SETUP ---
void setup() {
  Serial.begin(115200);
  
  dht.begin();
  Wire.begin(); // ESP32 30 pin dùng SDA=21, SCL=22
  
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
  pinMode(SOIL_PIN, INPUT);
  pinMode(RELAY_PIN, OUTPUT);
  digitalWrite(RELAY_PIN, RELAY_OFF); // Luôn tắt bơm khi khởi động

  if (!ina219.begin()) Serial.println("INA219 not found!");

  

  setup_wifi();
  timeClient.begin();
  configTime(gmtOffset_sec, daylightOffset_sec, ntpServer);
  client.setServer(mqtt_server, mqtt_port);
  client.setCallback(callback);
}

// --- LOOP ---
void loop() {
  if (!client.connected()) reconnect();
  client.loop();
  timeClient.update();

  unsigned long now = millis();

  // --- LOGIC BẢO VỆ HEARTBEAT (MỚI) ---
  // Nếu đang ở Mode AI mà mất kết nối Server quá 60s -> Đá về Mode Auto
  if (currentMode == MODE_AI) {
      if (now - lastServerHeartbeat > SERVER_TIMEOUT) {
          Serial.println("⚠️ MẤT KẾT NỐI SERVER (HEARTBEAT TIMEOUT)!");
          stopPump("Lost Heartbeat"); // Dừng ngay lập tức
          currentMode = MODE_AUTO;    // Chuyển về tự hành
          Serial.println("-> Fallback: Chuyen ve che do AUTO.");
      }
  }

  if (now - lastMsg > MSG_INTERVAL) {
    lastMsg = now;

    // 1. Đọc dữ liệu
    float temp = dht.readTemperature();
    float hum = dht.readHumidity();
    int soilRaw = analogRead(SOIL_PIN);
    int soilPercent = map(soilRaw, 4095, 1500, 0, 100); // Cân chỉnh lại số 1500 nếu cần
    soilPercent = constrain(soilPercent, 0, 100);

    float distance = getDistance();
    float waterLevel = 0;
    if (distance < heightTankWater) waterLevel = (1.0 - distance/heightTankWater) * 100;
    waterLevel = constrain(waterLevel, 0, 100);

    float battery = getBatteryPercent();

    if (isnan(temp) || isnan(hum)) Serial.println("DHT Error");

    // 2. Logic điều khiển (Smart)
    if (soilPercent < soilLowerLimit){
        sendAlert("soilMoisture", "Phát hiện đất khô.", soilPercent, soilLowerLimit);
    }
    if (waterLevel < MIN_WATER_LEVEL) {
        stopPump("Bể cần nước");
        // Gửi Alert: "Loại: water", "Ngưỡng: 10%"
        sendAlert("water", "Nguy hiểm: Bể nước sắp cạn!", waterLevel, MIN_WATER_LEVEL);
    } 
    else {
        // --- LOGIC MODE AUTO (CỤC BỘ) ---
        if (currentMode == MODE_AUTO) {
            if (soilPercent < soilLowerLimit && !isPumpRunning) {
                digitalWrite(RELAY_PIN, RELAY_ON);
                pumpStatus = "ON";
                isPumpRunning = true;
                pumpStartTime = millis();
                Serial.println("-> Auto Start Pump");

                // Gửi Alert: "Loại: soilMoisture", "Ngưỡng: soilLowerLimit"
                sendAlert("soilMoisture", "Phát hiện đất khô.", soilPercent, soilLowerLimit);
            }
            else if (isPumpRunning && soilPercent > soilUpperLimit) {
                stopPump("Đủ ẩm");
            }
        }
        
        // --- LOGIC MODE AI & MANUAL ---
        // (Không làm gì ở đây cả, vì việc Bật/Tắt đã được xử lý trong callback khi nhận lệnh)
        
        // --- LOGIC BẢO VỆ CHUNG (MAX DURATION) ---
        // Áp dụng cho TẤT CẢ các mode để tránh bơm chạy vô tận nếu lỗi
        if (isPumpRunning) {
            unsigned long elapsed = (millis() - pumpStartTime) / 1000;
            if (elapsed >= pumpMaxDuration) {
                stopPump("Quá giờ");

                // Gửi Alert: "Loại: pumpTimeout", "Ngưỡng: pumpMaxDuration"
                sendAlert("pumpTimeout", "Sự cố: Bơm chạy quá thời gian cho phép!", elapsed, pumpMaxDuration);
            }
        }
    }

    // 3. Gửi JSON
    StaticJsonDocument<512> doc;
    doc["device_id"] = DEVICE_ID;
    doc["timestamp"] = getFullTimestamp(); // Định dạng HH:MM:SS
    doc["epoch"] = timeClient.getEpochTime();
    switch(currentMode) {
        case MODE_MANUAL: doc["mode"] = "MANUAL"; break;
        case MODE_AUTO:   doc["mode"] = "AUTO"; break;
        case MODE_AI:     doc["mode"] = "AI"; break;
    }
    doc["temp"] = temp;
    doc["hum"] = hum;
    doc["soil"] = soilPercent;
    doc["water"] = waterLevel;
    doc["bat"] = battery;
    doc["pump"] = pumpStatus;

    doc["msg"] = warningMsg;
    
    // String rawJson;
    // serializeJson(doc, rawJson);

    // String signature = hmac_sha256(rawJson, SECRET_KEY);

    // // --- BƯỚC 3: Thêm chữ ký vào JSON ---
    // doc["signature"] = signature;

    char buffer[300];
    serializeJson(doc, buffer);
    client.publish(mqtt_topic_pub, buffer);
    Serial.println(buffer);
  }
}