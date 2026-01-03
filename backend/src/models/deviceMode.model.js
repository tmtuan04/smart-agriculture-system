import mongoose from "mongoose";

const deviceModeConfigSchema = new mongoose.Schema({
    deviceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Device",
        unique: true,
    },

    mode: {
        type: String,
        enum: ["manual", "auto", "ai"],
        default: "manual",
    },

    manualConfig: {
        thresholds: {
            soilMin: Number,
            soilMax: Number,
        },
    },

    autoConfig: {
        schedule: {
            hour: Number,
            minute: Number,
        },
        durationMinutes: Number,

        thresholds: {
            soilMin: Number,
            soilMax: Number,
        },

        enabled: {
            type: Boolean,
            default: false,
        },
    },

    aiConfig: {
        enabled: Boolean,
        modelVersion: String,
    },
});

const DeviceMode = mongoose.model("DeviceMode", deviceModeConfigSchema);

export default DeviceMode;
