import { InferenceSession, Tensor } from "onnxruntime-node";
import { readFileSync } from "fs";
import mongoose from "mongoose";
import Sensor from "../models/sensor.model.js";
import PumpSession from "../models/pumpSession.model.js";
import DeviceMode from "../models/deviceMode.model.js";
import { publishMQTT } from "../mqtt/mqttClient.js";

// --- 1. SETUP AI CONFIGURATION ---
// Đường dẫn file (tùy chỉnh lại cho đúng cấu trúc thư mục của bạn)
const MODEL_PATH = "./src/iot-ai/model.onnx";
const SCALER_PATH = "./src/iot-ai/scaler_params.json";

// Biến global để lưu session và scaler (tránh load lại nhiều lần)
let session = null;
let scalerData = null;
const DEVICE_ID = "ESP32_SMARTFARM_01"; // Thay bằng deviceId thực tế bạn muốn test

const activeAILoops = new Map();

// Hàm load scaler config
const loadScaler = () => {
  if (!scalerData) {
    try {
      const rawData = readFileSync(SCALER_PATH, "utf8");
      scalerData = JSON.parse(rawData);
      console.log("[AI] Scaler params loaded successfully.");
    } catch (e) {
      console.error("[AI] Error loading scaler params:", e);
    }
  }
};

// Hàm chuẩn hóa dữ liệu (Min-Max Scaling)
function scaleInput(inputArray) {
  if (!scalerData) loadScaler();
  const { min, max } = scalerData;
  return inputArray.map((val, i) => {
    return (val - min[i]) / (max[i] - min[i]);
  });
}

// Hàm dự đoán
async function predictScore(temp, hum, soil) {
  try {
    if (!session) {
      console.log("[AI] Loading ONNX model...");
      session = await InferenceSession.create(MODEL_PATH);
    }

    const rawInputArray = [temp, hum, soil];

    const scaledInput = scaleInput(rawInputArray);

    const tensor = new Tensor(
      "float32",
      Float32Array.from(scaledInput),
      [1, 3]
    );

    const feeds = { input: tensor };
    const results = await session.run(feeds);

    const outputKey = session.outputNames[0];
    const score = results[outputKey].data[0];

    return score;
  } catch (e) {
    console.error("[AI] Inference Error:", e);
    return null;
  }
}

// Hàm chính để chạy AI và điều khiển bơm
export const runAIAutoPumpForDevice = async ({ deviceId }) => {
  console.log(`[AI-MODE] Checking device ${deviceId}...`);

  try {
    const sensor = await Sensor.findOne({
      deviceId: new mongoose.Types.ObjectId(deviceId),
    }).sort({
      timestamp: -1,
    });

    if (!sensor) {
      console.warn(`[AI-MODE] No sensor data for device ${deviceId}`);
      return;
    }

    const score = await predictScore(
      sensor.temperature,
      sensor.humidity,
      sensor.soilMoisture
    );

    if (score === null) return;

    const activeSession = await PumpSession.findOne({
      deviceId,
      status: "running",
      mode: "ai",
    });

    if (score > 0.8) {
      console.log(`[AI-MODE] Score ${score.toFixed(4)} > 0.8 => COMMAND: ON`);

      if (!activeSession) {
        await startPump(deviceId, sensor);
      } else {
        console.log(`[AI-MODE] Pump is already ON.`);
      }
    } else if (score < 0.5) {
      console.log(`[AI-MODE] Score ${score.toFixed(4)} < 0.5 => COMMAND: OFF`);

      if (activeSession) {
        await stopPump(activeSession, sensor);
      } else {
        console.log(`[AI-MODE] Pump is already OFF.`);
      }
    } else {
      console.log(
        `[AI-MODE] Score ${score.toFixed(4)} is in [0.5, 0.8] => KEEP STATE`
      );
    }
  } catch (err) {
    console.error(`[AI-MODE][ERROR] device=${deviceId}`, err.message);
  }
};

// Hàm để khởi động vòng lặp kiểm tra AI định kỳ
export const startAILoop = async ({ deviceId }) => {
  if (activeAILoops.has(deviceId)) {
    console.log(`[AI-LOOP] Device ${deviceId} loop is already active.`);
    return;
  }

  console.log(`[AI-LOOP] STARTING loop for ${deviceId}`);

  const loop = async () => {
    try {
      const config = await DeviceMode.findOne({ deviceId });

      if (!config || config.mode !== "ai") {
        console.warn(
          `[AI-LOOP] Device ${deviceId} is NOT in AI mode anymore. STOPPING loop.`
        );
        activeAILoops.delete(deviceId);
        return;
      }

      await runAIAutoPumpForDevice({ deviceId });

      const timer = setTimeout(loop, 60 * 1000);

      activeAILoops.set(deviceId, timer);
    } catch (err) {
      console.error(`[AI-LOOP] Error in loop:`, err);
      const timer = setTimeout(loop, 60 * 1000);
      activeAILoops.set(deviceId, timer);
    }
  };

  loop();
};

// Hàm để dừng vòng lặp kiểm tra AI
export const stopAILoop = ({ deviceId }) => {
  if (activeAILoops.has(deviceId)) {
    clearTimeout(activeAILoops.get(deviceId));
    activeAILoops.delete(deviceId);
    console.log(`[AI-LOOP] Force stopped for ${deviceId}`);
  }
};

const startPump = async (deviceId, sensorData) => {
  const session = await PumpSession.create({
    deviceId,
    mode: "ai",
    startedAt: new Date(),
    trigger: "ai_decision",
    sensorBefore: {
      soilMoisture: sensorData.soilMoisture,
      temperature: sensorData.temperature,
      humidity: sensorData.humidity,
    },
    status: "running",
  });

  console.log(`[AI-MODE][PUMP] START session=${session._id}`);

  publishMQTT(process.env.MQTT_TOPIC_SUB, {
    mode: "ai",
    pump: "on",
    trigger: "ai",
    timestamp: new Date().toISOString(),
  });
};

const stopPump = async (session, sensorAfter) => {
  console.log(`[AI-MODE][PUMP] STOP session=${session._id}`);

  session.endedAt = new Date();
  session.durationSeconds = Math.floor(
    (session.endedAt - session.startedAt) / 1000
  );
  session.status = "completed";

  if (session.sensorBefore) {
    session.sensorAfter = session.sensorBefore;
  }

  await session.save();
  publishMQTT(process.env.MQTT_TOPIC_SUB, {
    mode: "ai",
    pump: "off",
    trigger: "ai",
    timestamp: new Date().toISOString(),
  });
};
