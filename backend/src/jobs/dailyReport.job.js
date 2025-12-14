import mongoose from "mongoose";
import Sensor from "../models/sensor.model.js";
import Report from "../models/report.model.js";

function getUTCDayRange(dateStr) {
    const [y, m, d] = dateStr.split("-").map(Number);

    const start = new Date(Date.UTC(y, m - 1, d, 0, 0, 0));
    const end   = new Date(Date.UTC(y, m - 1, d + 1, 0, 0, 0));

    return { start, end };
}

export async function generateDailyReport({ deviceId, date }) {
    if (!deviceId) {
        throw new Error("deviceId is required");
    }

    if (typeof date !== "string") {
        throw new Error("date must be YYYY-MM-DD string");
    }

    const deviceObjectId = new mongoose.Types.ObjectId(deviceId);
    const { start, end } = getUTCDayRange(date);

    try {
        const stats = await Sensor.aggregate([
            {
                $match: {
                    deviceId: deviceObjectId,
                    timestamp: { $gte: start, $lt: end },
                },
            },
            {
                $group: {
                    _id: null,

                    avgTemp: { $avg: "$temperature" },
                    minTemp: { $min: "$temperature" },
                    maxTemp: { $max: "$temperature" },

                    avgHum: { $avg: "$humidity" },
                    minHum: { $min: "$humidity" },
                    maxHum: { $max: "$humidity" },

                    avgSoil: { $avg: "$soilMoisture" },
                    minSoil: { $min: "$soilMoisture" },
                    maxSoil: { $max: "$soilMoisture" },

                    count: { $sum: 1 },
                },
            },
        ]);

        if (!stats.length) {
            return Report.findOneAndUpdate(
                { deviceId: deviceObjectId, reportDate: start },
                {
                    deviceId: deviceObjectId,
                    reportDate: start,
                    timezone: "UTC",
                    period: { startAt: start, endAt: end },
                    sampleCount: 0,
                    status: "completed",
                },
                { upsert: true, new: true }
            );
        }

        const s = stats[0];

        return Report.findOneAndUpdate(
            { deviceId: deviceObjectId, reportDate: start },
            {
                deviceId: deviceObjectId,
                reportDate: start,
                timezone: "UTC",
                period: { startAt: start, endAt: end },

                stats: {
                    temperature: {
                        avg: s.avgTemp,
                        min: s.minTemp,
                        max: s.maxTemp,
                    },
                    humidity: {
                        avg: s.avgHum,
                        min: s.minHum,
                        max: s.maxHum,
                    },
                    soilMoisture: {
                        avg: s.avgSoil,
                        min: s.minSoil,
                        max: s.maxSoil,
                    },
                },

                sampleCount: s.count,
                status: "completed",
                errorMessage: null,
            },
            { upsert: true, new: true }
        );

    } catch (err) {
        return Report.findOneAndUpdate(
            { deviceId: deviceObjectId, reportDate: start },
            {
                deviceId: deviceObjectId,
                reportDate: start,
                timezone: "UTC",
                period: { startAt: start, endAt: end },
                status: "failed",
                errorMessage: err.message,
            },
            { upsert: true, new: true }
        );
    }
}
