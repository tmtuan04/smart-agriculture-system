import mongoose from "mongoose";
import Sensor from "../models/sensor.model.js";
import Report from "../models/report.model.js";
import PumpSession from "../models/pumpSession.model.js";

function getUTCDayRange(date) {
    const d = new Date(date);

    const start = new Date(
        Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0)
    );

    const end = new Date(start);
    end.setUTCDate(end.getUTCDate() + 1);

    return { start, end };
}

export async function generateDailyReportForDevice(deviceId, date) {
    const deviceObjectId = new mongoose.Types.ObjectId(deviceId);
    const { start, end } = getUTCDayRange(date);

    try {
        /* ===== SENSOR STATS ===== */
        const sensorStats = await Sensor.aggregate([
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

        /* ===== PUMP STATS ===== */
        const pumpStats = await PumpSession.aggregate([
            {
                $match: {
                    deviceId: deviceObjectId,
                    startedAt: { $gte: start, $lt: end },
                    status: "completed",
                },
            },
            {
                $group: {
                    _id: null,
                    totalSessions: { $sum: 1 },
                    totalDurationSeconds: { $sum: "$durationSeconds" },
                    avgSoilIncrease: { $avg: "$delta.soilMoisture" },
                    maxSoilIncrease: { $max: "$delta.soilMoisture" },
                },
            },
        ]);

        const s = sensorStats[0] || {};
        const p = pumpStats[0] || {};

        return await Report.findOneAndUpdate(
            { deviceId: deviceObjectId, reportDate: start },
            {
                deviceId: deviceObjectId,
                reportDate: start,
                period: { startAt: start, endAt: end },

                stats: sensorStats.length
                    ? {
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
                      }
                    : undefined,

                watering: {
                    totalSessions: p.totalSessions || 0,
                    totalDurationMinutes: Math.round(
                        (p.totalDurationSeconds || 0) / 60
                    ),
                    avgSoilIncrease: p.avgSoilIncrease || null,
                    maxSoilIncrease: p.maxSoilIncrease || null,
                },

                generatedFrom: {
                    sensorCount: s.count || 0,
                    pumpSessionCount: p.totalSessions || 0,
                },

                status: "completed",
                errorMessage: null,
            },
            { upsert: true, new: true }
        );
    } catch (err) {
        return await Report.findOneAndUpdate(
            { deviceId: deviceObjectId, reportDate: start },
            {
                deviceId: deviceObjectId,
                reportDate: start,
                period: { startAt: start, endAt: end },
                status: "failed",
                errorMessage: err.message,
            },
            { upsert: true, new: true }
        );
    }
}
