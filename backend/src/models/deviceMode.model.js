import mongoose from "mongoose";

const deviceModeConfigSchema = new mongoose.Schema({
    deviceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Device",
        required: true,
        unique: true, // 1 device chỉ có 1 config active (cần xem lại cái này)
    },
    mode: {
        type: String,
        enum: ["manual", "auto", "ai"],
        required: true,
        default: "manual",
    },

    // Mode 1: Manual
    manualConfig: {
        isPumpOn: {
            type: Boolean,
            default: false,
        },
        startedAt: {
            type: Date,
            default: null,
        },
        stoppedAt: {
            type: Date,
            default: null,
        },
        // Vẫn cho phép set ngưỡng (để cảnh báo) -> Cảnh báo người dùng nếu quên tắt bơm
        // Bộ đếm: now - startedAt
        thresholds: {
            soilMin: Number,
            soilMax: Number,
        },
    },

    // Mode 2: Auto
    autoConfig: {
        schedule: {
            hour: Number, // mấy giờ trong ngày
            minute: Number,
        },
        duration: {
            type: Number, // phút
        },

        thresholds: {
            soilMin: Number,
            soilMax: Number,
        },

        enabled: {
            type: Boolean,
            default: true,
        },
    },

    // Mode 3: AI (không nên lưu vào đây -> tạo collection riêng)
    aiConfig: {
        enabled: {
            type: Boolean,
            default: false,
        },
        lastDecision: {
            type: String,
            enum: ["water", "skip"],
        },
        confidence: {
            type: Number, // %
        },
    },
})

const DeviceMode = mongoose.model("DeviceMode", deviceModeConfigSchema);

export default DeviceMode;