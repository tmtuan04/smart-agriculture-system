import express from "express"
import {
    getLatestSensor,
    insertSensorData
} from "../controllers/sensor.controller.js";

const router = express();

/**
 * @swagger
 * tags:
 *   name: Sensor
 *   description: Sensor data endpoints (ESP32 → Backend → Mobile)
 */

/**
 * @swagger
 * /sensor:
 *   post:
 *     summary: Insert sensor data (ESP32)
 *     tags: [Sensor]
 *     description: ESP32 publishes temperature, humidity, soil moisture. Backend saves to DB.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             deviceId: "67ac1234ef901234abcd5678"
 *             temperature: 29.8
 *             humidity: 68
 *             soilMoisture: 440
 *     responses:
 *       201:
 *         description: Sensor data saved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 deviceId:
 *                   type: string
 *                 temperature:
 *                   type: number
 *                 humidity:
 *                   type: number
 *                 soilMoisture:
 *                   type: number
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /sensor/latest/{deviceId}:
 *   get:
 *     summary: Get latest sensor data
 *     tags: [Sensor]
 *     description: Mobile app fetches the most recent sensor record for real-time display.
 *     parameters:
 *       - in: path
 *         name: deviceId
 *         required: true
 *         schema:
 *           type: string
 *         example: 67ac1234ef901234abcd5678
 *     responses:
 *       200:
 *         description: Latest sensor data
 *         content:
 *           application/json:
 *             example:
 *               temperature: 29.8
 *               humidity: 68
 *               soilMoisture: 440
 *               timestamp: "2025-03-01T10:00:00Z"
 *       404:
 *         description: No sensor data found
 *       500:
 *         description: Internal Server Error
 */

router.post("/", insertSensorData);                  // ESP32 gửi dữ liệu
router.get("/latest/:deviceId", getLatestSensor);    // mobile lấy sensor mới nhất

export default router;