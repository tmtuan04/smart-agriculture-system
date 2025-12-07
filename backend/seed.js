import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

import User from "./src/models/user.model.js";
import Device from "./src/models/device.model.js";
import Sensor from "./src/models/sensor.model.js";
import Alert from "./src/models/alert.model.js";

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

async function seed() {
    try {
        console.log("Clearing existing data...");
        await User.deleteMany({});
        await Device.deleteMany({});
        await Sensor.deleteMany({});
        await Alert.deleteMany({});
        console.log("Cleared.");

        // 1) Seed user test@gmail.com / 123456 (bcrypt saltRounds = 10)
        const hashedPassword = await bcrypt.hash("123456", 10);
        const user = await User.create({
            email: "test@gmail.com",
            fullName: "Test User",
            password: hashedPassword,
            profilePic: "",
        });
        console.log("User created:", user._id.toString());

        // 2) Seed single device
        const device = await Device.create({
            deviceId: "esp32-main-001",
            ownerId: user._id,
            name: "Main Farm Sensor",
            type: "ESP32",
            status: "online",
            lastActive: new Date(),
        });
        console.log("Device created:", device._id.toString());

        // 3) Seed multiple sensor data (20 records)
        const sensorData = [];
        for (let i = 0; i < 20; i++) {
            sensorData.push({
                deviceId: device._id,
                temperature: Number((20 + Math.random() * 15).toFixed(2)),
                humidity: Number((45 + Math.random() * 30).toFixed(2)),
                soilMoisture: Math.floor(250 + Math.random() * 400),
                timestamp: new Date(Date.now() - i * 60000), // mỗi bản ghi cách nhau 1 phút
            });
        }
        await Sensor.insertMany(sensorData);
        console.log("Sensor data inserted:", sensorData.length);

        // 4) Seed alerts (theo model mới: status = active|resolved, isRead = boolean)
        const alerts = [
            {
                deviceId: device._id,
                type: "temperature",
                message: "High temperature detected",
                value: 40,
                status: "active",
                isRead: false,
            },
            {
                deviceId: device._id,
                type: "humidity",
                message: "Humidity dropped below threshold",
                value: 30,
                status: "active",
                isRead: false,
            },
            {
                deviceId: device._id,
                type: "soilMoisture",
                message: "Soil moisture critical",
                value: 220,
                status: "active",
                isRead: true, // user already read this one
            },
            {
                deviceId: device._id,
                type: "temperature",
                message: "Temperature normalized after cooling",
                value: 26,
                status: "resolved",
                isRead: false, // resolved by system but user hasn't read
            },
            {
                deviceId: device._id,
                type: "humidity",
                message: "Humidity issue resolved automatically",
                value: 55,
                status: "resolved",
                isRead: true, // resolved and user has read
            },
        ];

        await Alert.insertMany(alerts);
        console.log("Alerts created:", alerts.length);

        console.log("Seed completed successfully!");
        process.exit(0);
    } catch (err) {
        console.error("Seed error:", err);
        process.exit(1);
    }
}

seed();
