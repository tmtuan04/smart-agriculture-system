import Sensor from "../models/sensor.model.js";
import PumpSession from "../models/pumpSession.model.js";
import { publishMQTT } from "../mqtt/mqttClient.js";

export const runAutoPumpForDevice = async (deviceMode) => {
    const { deviceId, autoConfig } = deviceMode;
    const { soilMin, soilMax } = autoConfig.thresholds;
    const durationSeconds = autoConfig.durationMinutes * 60;

    console.log(
        `[AUTO][DEVICE] Checking device ${deviceId} (soilMin=${soilMin})`
    );

    try {
        // Sensor mới nhất
        const sensor = await Sensor.findOne({ deviceId }).sort({
            timestamp: -1,
        });

        if (!sensor) {
            console.warn(
                `[AUTO][DEVICE] No sensor data for device ${deviceId}`
            );
            return;
        }

        console.log(`[AUTO][DEVICE] Latest soil=${sensor.soilMoisture}%`);

        // Không cần tưới
        if (sensor.soilMoisture >= soilMin) {
            console.log(`[AUTO][DEVICE] Skip watering (soil >= soilMin)`);
            return;
        }

        // Tạo session
        const session = await PumpSession.create({
            deviceId,
            mode: "auto",
            startedAt: new Date(),
            trigger: "schedule",
            sensorBefore: {
                soilMoisture: sensor.soilMoisture,
                temperature: sensor.temperature,
                humidity: sensor.humidity,
            },
        });

        console.log(
            `[AUTO][PUMP] START device=${deviceId} session=${session._id}`
        );

        // MQTT ON
        publishMQTT(process.env.MQTT_TOPIC_SUB, {
            mode: "auto",
            pump: "on",
            lower: soilMin,
            upper: soilMax,
            duration: durationSeconds,
            timestamp: new Date().toISOString(),
        });

        console.log(`[AUTO][MQTT] Published ON for device ${deviceId}`);

        // Auto stop
        setTimeout(async () => {
            await stopAutoPump(session._id);
        }, durationSeconds * 1000);
    } catch (err) {
        console.error(`[AUTO][DEVICE][ERROR] device=${deviceId}`, err.message);
    }
};

const stopAutoPump = async (sessionId) => {
    try {
        const session = await PumpSession.findById(sessionId);
        if (!session) {
            console.warn(`[AUTO][PUMP] Session not found ${sessionId}`);
            return;
        }

        if (session.status !== "running") {
            console.warn(
                `[AUTO][PUMP] Session ${sessionId} already ${session.status}`
            );
            return;
        }

        console.log(
            `[AUTO][PUMP] STOP device=${session.deviceId} session=${sessionId}`
        );

        const sensorAfter = await Sensor.findOne({
            deviceId: session.deviceId,
        }).sort({ timestamp: -1 });

        session.endedAt = new Date();
        session.durationSeconds = Math.floor(
            (session.endedAt - session.startedAt) / 1000
        );
        session.status = "completed";

        if (sensorAfter && session.sensorBefore) {
            session.sensorAfter = {
                soilMoisture: sensorAfter.soilMoisture,
                temperature: sensorAfter.temperature,
                humidity: sensorAfter.humidity,
            };
            session.delta = {
                soilMoisture:
                    sensorAfter.soilMoisture -
                    session.sensorBefore.soilMoisture,
            };
        }

        await session.save();

        publishMQTT(process.env.MQTT_TOPIC_SUB, {
            mode: "auto",
            pump: "off",
        });

        console.log(
            `[AUTO][MQTT] Published OFF for device ${session.deviceId}`
        );
    } catch (err) {
        console.error(`[AUTO][PUMP][ERROR] session=${sessionId}`, err.message);
    }
};
