import DeviceMode from "../models/deviceMode.model.js";
import { isValidObjectId } from "mongoose";
import { publishMQTT } from "../mqtt/mqttClient.js";
import { signMQTTData } from "../lib/mqttAuth.js";

// GET /devices/:id/mode-config
export const getDeviceModeConfig = async (req, res) => {
    try {
        const { id } = req.params;

        if (!isValidObjectId(id)) {
            return res.status(400).json({ message: "Invalid deviceId" });
        }

        const deviceMode = await DeviceMode.findOne({ deviceId: id });

        if (!deviceMode) {
            return res.status(404).json({
                message: "Mode config not found for this device",
            });
        }

        res.json(deviceMode);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// PATCH /devices/:id/mode, body: { mode: "manual" | "auto" | "ai" }
export const updateDeviceMode = async (req, res) => {
    try {
        const { id } = req.params;
        const { mode } = req.body;

        if (!isValidObjectId(id)) {
            return res.status(400).json({ message: "Invalid deviceId" });
        }

        if (!["manual", "auto", "ai"].includes(mode)) {
            return res.status(400).json({ message: "Invalid mode" });
        }

        const deviceMode = await DeviceMode.findOneAndUpdate(
            { deviceId: id },
            {
                deviceId: id,
                mode,
            },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );

        if (mode === "manual") {
            const payload = {
                mode: "manual",
            };

            console.log("[API] Publish manual mode command:", payload);

            publishMQTT(
                process.env.MQTT_TOPIC_SUB,
                signMQTTData({
                    mode: "manual",
                    timestamp: new Date().toISOString(),
                })
            );
        }

        res.json(deviceMode);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// PATCH /devices/:id/manual
// Lưu ý: config theo mode tự động chuyển mode theo nó
export const updateManualConfig = async (req, res) => {
    try {
        const { id } = req.params;

        if (!isValidObjectId(id)) {
            return res.status(400).json({ message: "Invalid deviceId" });
        }

        const deviceMode = await DeviceMode.findOneAndUpdate(
            { deviceId: id },
            {
                deviceId: id,
                mode: "manual",
                manualConfig: req.body,
            },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );

        res.json(deviceMode);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// PATCH /devices/:id/auto
export const updateAutoConfig = async (req, res) => {
    try {
        const { id } = req.params;

        if (!isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid deviceId",
            });
        }

        const { schedule, thresholds, durationMinutes, enabled } = req.body;

        // FE gửi giờ VN (GMT+7) → convert sang UTC
        let utcHour = schedule.hour - 7;
        if (utcHour < 0) utcHour += 24;

        const utcSchedule = {
            hour: utcHour,
            minute: schedule.minute,
        };

        const config = await DeviceMode.findOneAndUpdate(
            { deviceId: id },
            {
                deviceId: id,
                mode: "auto",
                autoConfig: {
                    schedule: utcSchedule,
                    thresholds,
                    durationMinutes,
                    enabled,
                },
            },
            {
                upsert: true,
                new: true,
                setDefaultsOnInsert: true,
            }
        );

        res.json({ success: true, config });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: "Update AUTO failed",
        });
    }
};

// PATCH /devices/:id/ai
export const updateAIConfig = async (req, res) => {
    try {
        const { id } = req.params;

        if (!isValidObjectId(id)) {
            return res.status(400).json({ message: "Invalid deviceId" });
        }

        const deviceMode = await DeviceMode.findOneAndUpdate(
            { deviceId: id },
            {
                deviceId: id,
                mode: "ai",
                aiConfig: req.body,
            },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );

        res.json(deviceMode);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
