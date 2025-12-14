import "dotenv/config";
import mongoose from "mongoose";
import { generateDailyReport } from "../jobs/dailyReport.job.js";

await mongoose.connect(process.env.MONGODB_URL);

const deviceId = "6935513b52ef8c9bda001fcc";
const report = await generateDailyReport({deviceId, date: "2025-12-07"});

console.log(report);

process.exit(0);