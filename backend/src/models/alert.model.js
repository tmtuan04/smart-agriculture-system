import mongoose from "mongoose";

const alertSchema = new mongoose.Schema(
    {
        deviceId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Device",
            required: true,
        },
        type: {
            type: String,
            enum: ["temperature", "humidity", "soilMoisture"],
            required: true,
        },
        message: {
            type: String,
            required: true,
        },
        value: {
            type: Number,
            required: true,
        },

        // Trạng thái kỹ thuật (hệ thống)
        status: {
            type: String,
            enum: ["active", "resolved"],
            default: "active",
        },

        // Trạng thái người dùng
        isRead: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

export default mongoose.model("Alert", alertSchema);
