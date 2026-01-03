import mongoose from "mongoose";

const alertSchema = new mongoose.Schema(
    {
        deviceId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Device",
            required: true,
            index: true,
        },

        type: {
            type: String,
            enum: ["temperature", "humidity", "soilMoisture", "pump", "system"],
            required: true,
        },

        message: {
            type: String,
            required: true,
        },

        value: {
            type: Number,
        },

        // Alert được sinh ra từ đâu
        source: {
            type: String,
            enum: ["sensor", "pump", "system"],
            required: true,
        },

        // Tham chiếu đến bản ghi gốc (Sensor / PumpSession / null)
        sourceRefId: {
            type: mongoose.Schema.Types.ObjectId,
        },

        // Trạng thái kỹ thuật
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

        resolvedAt: {
            type: Date,
        },
    },
    { timestamps: true }
);

alertSchema.index({ deviceId: 1, status: 1 });
alertSchema.index({ source: 1, sourceRefId: 1 });

const Alert = mongoose.model("Alert", alertSchema);

export default Alert;
