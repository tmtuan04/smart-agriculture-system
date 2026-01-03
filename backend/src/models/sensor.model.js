import mongoose from "mongoose";

const sensorSchema = new mongoose.Schema(
    {
        deviceId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Device",
            required: true,
        },
        // Thời điểm sensor gửi dữ liệu
        timestamp: {
            type: Date,
            default: Date.now,
            required: true,
        },
        // Nhiệt độ (°C)
        temperature: {
            type: Number,
            required: true,
        },
        // Độ ẩm (%)
        humidity: {
            type: Number,
            required: true,
        },
        // Độ ẩm đất (%)
        soilMoisture: {
            type: Number,
            required: true,
        },
        // Mức pin của thiết bị (%)
        battery: {
            type: Number,
            required: false, // Có thể optional nếu thiết bị chưa gửi
            default: null,
        },
        // Mức nước (m)
        water: {
            type: Number,
            required: false,
            default: null,
        },
    },
    { timestamps: true }
);

sensorSchema.index({ deviceId: 1, timestamp: 1 });

const Sensor = mongoose.model("Sensor", sensorSchema);

export default Sensor;