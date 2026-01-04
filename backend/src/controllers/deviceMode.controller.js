import DeviceMode from "../models/deviceMode.model.js";

// GET /devices/:id/mode-config
export const getDeviceModeConfig = async (req, res) => {
    try {
        const deviceMode = await DeviceMode.findOne({
            deviceId: req.params.id,
        });

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
        const { mode } = req.body;

        if (!["manual", "auto", "ai"].includes(mode)) {
            return res.status(400).json({ message: "Invalid mode" });
        }

        const update = {
            mode,
        };

        // Nếu rời manual → tắt bơm
        if (mode !== "manual") {
            update["manualConfig.isPumpOn"] = false;
            update["manualConfig.stoppedAt"] = new Date();
        }

        const deviceMode = await DeviceMode.findOneAndUpdate(
            { deviceId: req.params.id },
            update,
            { new: true, upsert: true }
        );

        res.json(deviceMode);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// PATCH /devices/:id/manual
// Lưu ý: config theo mode tự động chuyển mode theo nó
export const updateManualConfig = async (req, res) => {
    try {
        const deviceMode = await DeviceMode.findOneAndUpdate(
            { deviceId: req.params.id },
            {
                mode: "manual",
                manualConfig: req.body,
            },
            { new: true, upsert: true }
        );

        res.json(deviceMode);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// PATCH /devices/:id/auto
export const updateAutoConfig = async (req, res) => {
    const { deviceId } = req.params;
    const { hour, minute, lower, upper, durationSeconds, enabled } = req.body;

    const config = await DeviceMode.findOneAndUpdate(
        { deviceId },
        {
            // mode: "auto",
            autoConfig: {
                schedule: { hour, minute },
                thresholds: {
                    soilMin: lower,
                    soilMax: upper,
                },
                durationMinutes: Math.ceil(durationSeconds / 60),
                enabled,
            },
        },
        { upsert: true, new: true }
    );

    res.json({ success: true, config });
};

// PATCH /devices/:id/ai
export const updateAIConfig = async (req, res) => {
    try {
        const deviceMode = await DeviceMode.findOneAndUpdate(
            { deviceId: req.params.id },
            {
                mode: "ai",
                aiConfig: req.body,
            },
            { new: true, upsert: true }
        );

        res.json(deviceMode);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
