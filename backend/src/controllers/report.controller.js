import Report from "../models/report.model.js";
import Sensor from "../models/sensor.model.js";

export async function generateDailyReportForDevice(deviceId, reportDate) {
    const startOfDay = new Date(reportDate);
    startOfDay.setUTCHours(0, 0, 0, 0);

    const endOfDay = new Date(startOfDay);
    endOfDay.setUTCDate(endOfDay.getUTCDate() + 1);

    // Tạo report trước (pending) để tránh cron chạy trùng
    let report = await Report.findOneAndUpdate(
        { deviceId, reportDate: startOfDay },
        {
            deviceId,
            reportDate: startOfDay,
            timezone: "UTC",
            period: {
                startAt: startOfDay,
                endAt: endOfDay,
            },
            status: "pending",
        },
        { upsert: true, new: true }
    );

    try {
        const stats = await Sensor.aggregate([
            {
                $match: {
                    deviceId,
                    timestamp: { $gte: startOfDay, $lt: endOfDay },
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
            report.sampleCount = 0;
            report.status = "completed";
            report.generatedAt = new Date();
            await report.save();
            return report;
        }

        const s = stats[0];

        report.stats = {
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
        };

        report.sampleCount = s.count;
        report.status = "completed";
        report.generatedAt = new Date();

        await report.save();
        return report;
    } catch (err) {
        report.status = "failed";
        report.errorMessage = err.message;
        await report.save();
        throw err;
    }
}