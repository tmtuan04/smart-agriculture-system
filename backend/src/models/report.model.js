import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
    {
        deviceId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Device",
            required: true,
            index: true,
        },

        // Ngày report (theo timezone của Device)
        reportDate: {
            type: Date,
            required: true,
            index: true,
        },

        period: {
            startAt: {
                type: Date,
                required: true,
            },
            endAt: {
                type: Date,
                required: true,
            },
        },

        // Thống kê tưới nước
        watering: {
            totalSessions: {
                type: Number,
                default: 0,
            },
            totalDurationMinutes: {
                type: Number,
                default: 0,
            },
            avgSoilIncrease: Number,
            maxSoilIncrease: Number,
        },

        // Thống kê sensor
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

        // Metadata để trace
        generatedFrom: {
            sensorCount: {
                type: Number,
                default: 0,
            },
            pumpSessionCount: {
                type: Number,
                default: 0,
            },
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
reportSchema.index({ deviceId: 1, reportDate: 1 }, { unique: true });

const Report = mongoose.model("Report", reportSchema);

export default Report;
