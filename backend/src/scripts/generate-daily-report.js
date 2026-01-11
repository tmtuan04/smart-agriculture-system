import "dotenv/config";
import mongoose from "mongoose";
import Device from "../models/device.model.js";
import { generateDailyReportForDevice } from "../controllers/report.controller.js";

async function run() {
    await mongoose.connect(process.env.MONGODB_URL);

    const today = new Date();
    const devices = await Device.find({}, { _id: 1 });

    for (const device of devices) {
        await generateDailyReportForDevice(device._id, today);
    }

    await mongoose.disconnect();
    process.exit(0);
}

run();