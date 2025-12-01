import "dotenv/config"
import mongoose from "mongoose";
import User from "./src/models/user.model.js";
import Device from "./src/models/device.model.js";
import Sensor from "./src/models/sensor.model.js";
import Alert from "./src/models/alert.model.js";
import Report from "./src/models/report.model.js";

// Connect MongoDB

const MONGO_URI = process.env.MONGODB_URL;

mongoose.connect(MONGO_URI)
    .then(() => console.log("MongoDB connected"))
    .catch((err) => console.error("Mongo error:", err));

// Seed data

async function seed() {
    try {
        console.log("Clearing existing data...");

        await User.deleteMany({});
        await Device.deleteMany({});
        await Sensor.deleteMany({});
        await Alert.deleteMany({});
        await Report.deleteMany({});

        console.log("Data cleared!");
    
        const user = await User.create({
            email: "admin@example.com",
            fullName: "Admin User",
            password: "123456",
            profilePic: ""
        });

        console.log("User created:", user._id.toString());

        const device1 = await Device.create({
            deviceId: "esp32-001",
            ownerId: user._id,
            name: "Farm Sensor 01",
            type: "ESP32",
            status: "online",
            lastActive: new Date()
        });

        const device2 = await Device.create({
            deviceId: "esp32-002",
            ownerId: user._id,
            name: "Farm Sensor 02",
            type: "ESP32",
            status: "offline",
            lastActive: null
        });

        console.log("Devices created!");

        const sensorData = [];

        for (let i = 0; i < 10; i++) {
            sensorData.push({
                deviceId: device1._id,
                temperature: 25 + Math.random() * 5,
                humidity: 60 + Math.random() * 10,
                soilMoisture: 400 + Math.floor(Math.random() * 200),
                timestamp: new Date(Date.now() - i * 60000)
            });

            sensorData.push({
                deviceId: device2._id,
                temperature: 26 + Math.random() * 4,
                humidity: 55 + Math.random() * 12,
                soilMoisture: 350 + Math.floor(Math.random() * 150),
                timestamp: new Date(Date.now() - i * 40000)
            });
        }

        await Sensor.insertMany(sensorData);

        console.log("Sensor data created!");

        await Alert.insertMany([
            {
                deviceId: device1._id,
                type: "temperature",
                message: "High temperature detected",
                value: 38,
                status: "unread",
            },
            {
                deviceId: device1._id,
                type: "soilMoisture",
                message: "Soil moisture too low",
                value: 300,
                status: "unread",
            },
            {
                deviceId: device2._id,
                type: "humidity",
                message: "Humidity dropped!",
                value: 40,
                status: "read",
            }
        ]);

        console.log("Alerts created!");

        await Report.insertMany([
            {
                deviceId: device1._id,
                date: "2025-01-01",
                avgTem: 27.3,
                avgHum: 65.5,
                maxTem: 31.2,
                minTem: 23.8,
            },
            {
                deviceId: device2._id,
                date: "2025-01-01",
                avgTem: 28.1,
                avgHum: 63.0,
                maxTem: 30.7,
                minTem: 24.1,
            }
        ]);

        console.log("Reports created!");

        console.log("Seed completed successfully!");
        process.exit(0);

    } catch (err) {
        console.error("Seed error:", err);
        process.exit(1);
    }
}

seed();