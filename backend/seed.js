import "dotenv/config";
import mongoose from "mongoose";

import DeviceMode from "./src/models/deviceMode.model.js";

const MONGO_URI = process.env.MONGODB_URL;
if (!MONGO_URI) {
    console.error("Please set MONGODB_URL in your .env");
    process.exit(1);
}

mongoose
    .connect(MONGO_URI)
    .then(() => console.log("MongoDB connected"))
    .catch((err) => {
        console.error("MongoDB connection error:", err);
        process.exit(1);
    });

async function seedDeviceMode() {
    try {
        const deviceId = "6935513b52ef8c9bda001fcc";

        console.log("Removing existing DeviceMode config (if any)...");
        await DeviceMode.deleteMany({ deviceId });

        console.log("Seeding DeviceMode...");

        const deviceMode = await DeviceMode.create({
            deviceId,
            mode: "manual",

            manualConfig: {
                isPumpOn: false,
                startedAt: null,
                stoppedAt: null,
                thresholds: {
                    soilMin: 30,
                    soilMax: 80,
                },
            },

            autoConfig: {
                schedule: {
                    hour: 6,
                    minute: 30,
                },
                duration: 15,
                thresholds: {
                    soilMin: 40,
                    soilMax: 75,
                },
                enabled: true,
            },

            aiConfig: {
                enabled: false,
                lastDecision: "skip",
                confidence: 0.0,
            },
        });

        console.log("DeviceMode seeded successfully:");
        console.log({
            id: deviceMode._id.toString(),
            deviceId: deviceMode.deviceId.toString(),
            mode: deviceMode.mode,
        });

        process.exit(0);
    } catch (err) {
        console.error("Seed DeviceMode error:", err);
        process.exit(1);
    }
}

seedDeviceMode();