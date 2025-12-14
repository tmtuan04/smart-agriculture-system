import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
    {
        deviceId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Device",
            required: true,
            index: true,
        },
        reportDate: {
            type: Date,
            required: true,
            index: true,
        },
        timezone: {
            type: String,
            default: "UTC", // ví dụ: Asia/Ho_Chi_Minh
        },
        period: {
            startAt: Date,
            endAt: Date,
        },
        stats: {
            temperature: {
                avg: Number,
                min: Number,
                max: Number,
            },
            humidity: {
                avg: Number,
                min: Number,
                max: Number,
            },
            soilMoisture: {
                avg: Number,
                min: Number,
                max: Number,
            },
        },
        sampleCount: {
            type: Number, // số bản ghi sensor dùng để tính
            default: 0,
        },
        status: {
            type: String,
            enum: ["pending", "completed", "failed"],
            default: "pending",
        },
        errorMessage: {
            type: String,
        },
        generatedAt: {
            type: Date,
            default: Date.now,
        },
    },
    { timestamps: true }
);

// Mỗi device chỉ có 1 report / ngày
reportSchema.index(
    { deviceId: 1, reportDate: 1 },
    { unique: true }
);

const Report = mongoose.model("Report", reportSchema);

export default Report;