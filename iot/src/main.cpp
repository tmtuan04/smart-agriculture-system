#include <Arduino.h>
#include <WiFi.h>
#include <WiFiClientSecure.h> 
#include <PubSubClient.h>
#include <ArduinoJson.h>
#include <Wire.h>
#include <Adafruit_INA219.h>
#include <DHT.h>

const char* ssid = WIFI_SSID;
const char* password = WIFI_PASS;
const char* mqtt_server = MQTT_SERVER;
const char* mqtt_user = HIVEMQ_USERNAME;
const char* mqtt_pass = HIVEMQ_PASSWORD;
const int mqtt_port = atoi(MQTT_PORT); 
const char* mqtt_topic = MQTT_TOPIC; 

#define DHTPIN 4
#define DHTTYPE DHT11
#define SOIL_PIN 34        
#define TRIG_PIN 5
#define ECHO_PIN 18
#define RELAY_PIN 19        

WiFiClientSecure espClient; 
PubSubClient client(espClient);
DHT dht(DHTPIN, DHTTYPE);
Adafruit_INA219 ina219;

unsigned long lastMsg = 0;
#define MSG_INTERVAL 5000  
float heightTankWater = 100.0; 


float getDistance() {
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);
  long duration = pulseIn(ECHO_PIN, HIGH);
  return duration * 0.034 / 2;
}

float getBatteryPercent() {
  float busVoltage = ina219.getBusVoltage_V();
  float shuntVoltage = ina219.getShuntVoltage_mV() / 1000.0;
  float loadVoltage = busVoltage + shuntVoltage;
  
  float percent = (loadVoltage - 9.0) / (12.6 - 9.0) * 100.0;
  return constrain(percent, 0.0, 100.0);
}

// Connect to WiFi and MQTT

void setup_wifi() {
  delay(10);
  Serial.print("\nConnecting to WiFi: ");
  Serial.println(ssid);

  WiFi.mode(WIFI_STA); 
  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi Connected!");
  
  espClient.setInsecure();
}

void reconnect() {
  while (!client.connected()) {
    Serial.print("Connecting MQTT HiveMQ (SSL)...");
    String clientId = "ESP32-Garden-" + String(random(0xffff), HEX);
    
    if (client.connect(clientId.c_str(), mqtt_user, mqtt_pass)) {
      Serial.println("CONNECTED!");
    } else {
      Serial.print("Error, rc=");
      Serial.print(client.state());
      Serial.println(" (Retrying in 5 seconds)");
      delay(5000);
    }
  }
}

// Setup
void setup() {
  Serial.begin(115200);
  

  dht.begin();
  Wire.begin();
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
  pinMode(SOIL_PIN, INPUT);
  pinMode(RELAY_PIN, OUTPUT);
  digitalWrite(RELAY_PIN, LOW); 

  if (!ina219.begin()) {
    Serial.println("Error: INA219 not found!");
  }

  setup_wifi();
  client.setServer(mqtt_server, mqtt_port);
}

// Loop
void loop() {
  if (!client.connected()) {
    reconnect();
  }
  client.loop();

  unsigned long now = millis();
  if (now - lastMsg > MSG_INTERVAL) {
    lastMsg = now;

    // 1. Read data from sensors
    float temp = dht.readTemperature();
    float hum = dht.readHumidity();
    
    // Read soil moisture
    int soilRaw = analogRead(SOIL_PIN);
    int soilPercent = map(soilRaw, 4095, 1500, 0, 100); 
    soilPercent = constrain(soilPercent, 0, 100);

    // Read water level
    float distance = getDistance();
    float waterLevel = constrain((1 - distance/heightTankWater) * 100, 0, 100);

    // Read battery
    float battery = getBatteryPercent();

    // Check sensor errors
    if (isnan(temp) || isnan(hum)) {
      Serial.println("Error reading DHT11!");
      return; 
    }

    // 2. Pack JSON data
    StaticJsonDocument<256> doc;
    doc["temp"] = temp;
    doc["hum"] = hum;
    doc["soil"] = soilPercent;
    doc["water"] = waterLevel;
    doc["bat"] = battery;

    char buffer[256];
    serializeJson(doc, buffer);

    // 3. Publish to MQTT
    Serial.print("Publishing: ");
    Serial.println(buffer);
    client.publish(mqtt_topic, buffer);
  }
}