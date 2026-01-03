import mongoose from "mongoose";

const pumpSessionSchema = new mongoose.Schema(
    {
        deviceId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Device",
            required: true,
            index: true,
        },

        // Mode gây ra lần bơm
        mode: {
            type: String,
            enum: ["manual", "auto", "ai"],
            required: true,
        },

        // Thời gian
        startedAt: {
            type: Date,
            required: true,
        },
        endedAt: {
            type: Date,
        },

        durationSeconds: {
            type: Number,
        },

        // Ai / cái gì kích hoạt
        trigger: {
            type: String,
            enum: ["user", "schedule", "threshold", "ai_decision"],
        },

        // Sensor snapshot
        sensorBefore: {
            soilMoisture: Number,
            temperature: Number,
            humidity: Number,
        },

        sensorAfter: {
            soilMoisture: Number,
            temperature: Number,
            humidity: Number,
        },

        // Hiệu quả: cái này chắc cần update thêm
        delta: {
            soilMoisture: Number, // after - before
        },

        status: {
            type: String,
            enum: ["running", "completed", "aborted", "failed"],
            default: "running",
        },

        note: String,
    },
    { timestamps: true }
);

const PumpSession = mongoose.model("PumpSession", pumpSessionSchema);

export default PumpSession;