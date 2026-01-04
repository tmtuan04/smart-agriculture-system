import "dotenv/config";
import mongoose from "mongoose";
import Device from "../models/device.model.js";
import { generateDailyReportForDevice } from "../controllers/report.controller.js";

async function run() {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log("MongoDB connected");

    const yesterday = new Date();
    yesterday.setUTCDate(yesterday.getUTCDate() - 1);

    const devices = await Device.find({}, { _id: 1 });

    for (const device of devices) {
        try {
            await generateDailyReportForDevice(device._id, yesterday);
            console.log(`✔ Report generated for device ${device._id}`);
        } catch (err) {
            console.error(`✖ Report failed for device ${device._id}`, err.message);
        }
    }

    await mongoose.disconnect();
    process.exit(0);
}

run();
