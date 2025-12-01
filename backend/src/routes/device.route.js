import express from "express"
import {
    getUserDevices,
    getDeviceById,
    updateDevice,
} from "../controllers/device.controller.js";

const router = express();

/**
 * @swagger
 * tags:
 *   name: Device
 *   description: Manage IoT devices assigned to users
 */

/**
 * @swagger
 * /device/user/{ownerId}:
 *   get:
 *     summary: Get all devices of a user
 *     tags: [Device]
 *     description: Mobile app fetches list of ESP32/IoT devices mapped to current logged-in user.
 *     parameters:
 *       - in: path
 *         name: ownerId
 *         required: true
 *         schema:
 *           type: string
 *         example: 67ac1234ef901234abcd5678
 *     responses:
 *       200:
 *         description: List of devices
 *         content:
 *           application/json:
 *             example:
 *               - _id: 67ac1234ef901234abcd5678
 *                 deviceId: "ESP32_01"
 *                 name: "Vườn rau ban công"
 *                 type: "ESP32"
 *                 status: "online"
 *                 lastActive: "2025-02-20T10:01:00Z"
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /device/{id}:
 *   get:
 *     summary: Get device detail by ID
 *     tags: [Device]
 *     description: Retrieve detail of a device so mobile can display info.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: 67ac1234ef901234abcd5678
 *     responses:
 *       200:
 *         description: Device detail
 *         content:
 *           application/json:
 *             example:
 *               deviceId: "ESP32_01"
 *               name: "Garden Monitor"
 *               type: "ESP32"
 *               status: "online"
 *       404:
 *         description: Device not found
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /device/{id}:
 *   put:
 *     summary: Update device info
 *     tags: [Device]
 *     description: Mobile allows renaming device or updating settings.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: 67ac1234ef901234abcd5678
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           example:
 *             name: "Máy đo độ ẩm đất"
 *             type: "ESP32"
 *             status: "online"
 *     responses:
 *       200:
 *         description: Updated device info
 *       404:
 *         description: Device not found
 *       500:
 *         description: Internal Server Error
 */

router.get("/user/:ownerId", getUserDevices);
router.get("/:id", getDeviceById);
router.put("/:id", updateDevice);

export default router;