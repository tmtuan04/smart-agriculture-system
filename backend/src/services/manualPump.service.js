import Device from "../models/device.model.js";
import DeviceMode from "../models/deviceMode.model.js";
import PumpSession from "../models/pumpSession.model.js";
import Sensor from "../models/sensor.model.js";
import { publishMQTT } from "../mqtt/mqttClient.js";

export const manualPumpControl = async ({ deviceId, action }) => {
    if (!["on", "off"].includes(action)) {
        throw new Error("Invalid pump action");
    }

    const device = await Device.findById(deviceId);
    if (!device) {
        throw new Error("Device not found");
    }

    // Sensor snapshot trước khi bơm
    const sensorBefore = await Sensor.findOne({ deviceId }).sort({
        timestamp: -1,
    });

    if (action === "on") {
        await PumpSession.create({
            deviceId,
            mode: "manual",
            startedAt: new Date(),
            trigger: "user",
            sensorBefore: sensorBefore
                ? {
                    soilMoisture: sensorBefore.soilMoisture,
                    temperature: sensorBefore.temperature,
                    humidity: sensorBefore.humidity,
                } : null,
        });
    }

    if (action === "off") {
        const session = await PumpSession.findOne({
            deviceId,
            status: "running",
            mode: "manual",
        }).sort({ startedAt: -1 });

        if (session) {
            const sensorAfter = await Sensor.findOne({ deviceId }).sort({
                timestamp: -1,
            });

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
        }
    }

    // Update mode
    await DeviceMode.findOneAndUpdate(
        { deviceId },
        { mode: "manual" },
        { upsert: true }
    );

    // Publish MQTT command
    publishMQTT(process.env.MQTT_TOPIC_SUB, {
        mode: "manual",
        pump: action,
    });

    return { success: true };
};
