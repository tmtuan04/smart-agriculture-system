import Report from "../models/report.model.js";
import Sensor from "../models/sensor.model.js";
import PumpSession from "../models/pumpSession.model.js";

// GET /reports
export const getReports = async (req, res) => {
    try {
        const { deviceId, from, to } = req.query;
        const filter = {};

        if (deviceId) filter.deviceId = deviceId;

        if (from || to) {
            filter.reportDate = {};
            if (from) filter.reportDate.$gte = new Date(from);
            if (to) filter.reportDate.$lte = new Date(to);
        }

        const reports = await Report.find(filter)
            .sort({ reportDate: -1 })
            .populate("deviceId", "name deviceId");

        res.status(200).json({
            success: true,
            count: reports.length,
            data: reports,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// GET /reports/:id
export const getReportById = async (req, res) => {
    try {
        const report = await Report.findById(req.params.id).populate(
            "deviceId",
            "name deviceId"
        );

        if (!report) {
            return res
                .status(404)
                .json({ success: false, message: "Report not found" });
        }

        res.status(200).json({ success: true, data: report });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export async function generateDailyReportForDevice(deviceId, reportDate) {
    const startOfDay = new Date(reportDate);
    startOfDay.setUTCHours(0, 0, 0, 0);

    const endOfDay = new Date(startOfDay);
    endOfDay.setUTCDate(endOfDay.getUTCDate() + 1);

    // Lock / upsert report
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
            errorMessage: undefined,
        },
        { upsert: true, new: true }
    );

    try {
        /* ================= SENSOR ================= */
        const sensorCount = await Sensor.countDocuments({
            deviceId,
            timestamp: { $gte: startOfDay, $lt: endOfDay },
        });

        const sensorStats = await Sensor.aggregate([
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
                },
            },
        ]);

        /* ================= PUMP ================= */
        const pumpStats = await PumpSession.aggregate([
            {
                $match: {
                    deviceId,
                    startedAt: { $gte: startOfDay, $lt: endOfDay },
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

        /* ================= ASSIGN ================= */
        if (sensorStats.length) {
            const s = sensorStats[0];

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
        }

        report.generatedFrom = {
            sensorCount,
            pumpSessionCount: pumpStats.length
                ? pumpStats[0].totalSessions
                : 0,
        };

        if (pumpStats.length) {
            const p = pumpStats[0];
            report.watering = {
                totalSessions: p.totalSessions,
                totalDurationMinutes: Math.round(
                    (p.totalDurationSeconds || 0) / 60
                ),
                avgSoilIncrease: p.avgSoilIncrease,
                maxSoilIncrease: p.maxSoilIncrease,
            };
        }

        report.sampleCount = sensorCount;
        report.status = "completed";
        report.generatedAt = new Date();
        report.errorMessage = undefined;

        await report.save();
        return report;
    } catch (err) {
        report.status = "failed";
        report.errorMessage = err.message;
        await report.save();
        throw err;
    }
}
