import mongoose from "mongoose";

const sensorSchema = new mongoose.Schema(
    {
        deviceId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Device",
            required: true,
        },
        timestamp: {
            type: Date,
            default: Date.now,
        },
        // Nhiệt độ
        temperature: {
            type: Number,
            required: true,
        },
        // Độ ẩm
        humidity: {
            type: Number,
            required: true,
        },
        // Độ ẩm đất
        soilMoisture: {
            type: Number,
            required: true,
        },
    },
    { timestamps: true }
);

sensorSchema.index({ deviceId: 1, timestamp: 1 });

const Sensor = mongoose.model("Sensor", sensorSchema);

export default Sensor;