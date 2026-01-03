import 'dotenv/config'
import mongoose from 'mongoose'
import Device from '../models/device.model.js'
import { generateDailyReportForDevice } from '../controllers/report.controller.js'

const MONGODB_URL = process.env.MONGODB_URL

async function run() {
    await mongoose.connect(MONGODB_URL);
    console.log("MongoDB connected");

    // Report cho NGÀY HÔM QUA (UTC)
    const reportDate = new Date();
    reportDate.setUTCDate(reportDate.getUTCDate() - 1); // Sat Dec 13 2025 21:22:14 GMT+0700 (GMT+07:00)

    // Lấy danh sách tất cả device, nhưng chỉ trường _id
    const devices = await Device.find({}, { _id: 1 });

    for (const device of devices) {
        try {
            await generateDailyReportForDevice(device._id, reportDate);
            console.log(`✔ Report generated for device ${device._id}`);
        } catch (err) {
            console.error(`✖ Report failed for device ${device._id}:`, err.message);
        }
    }

    await mongoose.disconnect();
    process.exit(0);
}

run().catch((err) => {
    console.error("Cron job failed:", err);
    process.exit(1);
});
