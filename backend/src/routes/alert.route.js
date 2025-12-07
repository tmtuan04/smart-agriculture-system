import express from "express"
import { getAlertById, getAlerts, markAlertAsRead, markAlertAsResolved } from "../controllers/alert.controller.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Alerts
 *   description: Alert management for smart agriculture system
 */

/**
 * @swagger
 * /alerts:
 *   get:
 *     summary: Get all alerts
 *     tags: [Alerts]
 *     description: Retrieve all alerts with optional filtering by deviceId, type, status, and isRead.
 *     parameters:
 *       - in: query
 *         name: deviceId
 *         schema:
 *           type: string
 *         description: Filter by deviceId
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [temperature, humidity, soilMoisture]
 *         description: Filter by alert type
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, resolved]
 *         description: Filter by alert system status
 *       - in: query
 *         name: isRead
 *         schema:
 *           type: boolean
 *         description: Filter alerts by read/unread state (true = read)
 *     responses:
 *       200:
 *         description: List of alerts retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: number
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       deviceId:
 *                         type: string
 *                       type:
 *                         type: string
 *                       message:
 *                         type: string
 *                       value:
 *                         type: number
 *                       status:
 *                         type: string
 *                         enum: [active, resolved]
 *                       isRead:
 *                         type: boolean
 *                       createdAt:
 *                         type: string
 *                       updatedAt:
 *                         type: string
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /alerts/{id}:
 *   get:
 *     summary: Get alert by ID
 *     tags: [Alerts]
 *     description: Retrieve the details of a specific alert.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Alert ID
 *     responses:
 *       200:
 *         description: Alert retrieved successfully
 *       404:
 *         description: Alert not found
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /alerts/{id}/read:
 *   patch:
 *     summary: Mark alert as read
 *     tags: [Alerts]
 *     description: Set the alert's isRead property to true.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Alert ID
 *     responses:
 *       200:
 *         description: Alert marked as read
 *       404:
 *         description: Alert not found
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /alerts/{id}/resolve:
 *   patch:
 *     summary: Mark alert as resolved
 *     tags: [Alerts]
 *     description: Update the alert's system status to 'resolved'.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Alert ID
 *     responses:
 *       200:
 *         description: Alert marked as resolved
 *       404:
 *         description: Alert not found
 *       500:
 *         description: Internal Server Error
 */

// 1. Lấy danh sách tất cả alerts
router.get("/", getAlerts);

// 2. Lấy alert theo id
router.get("/:id", getAlertById);

// 3. Đánh dấu alert là đã đọc
router.patch("/:id/read", markAlertAsRead);

// 4. Đánh dấu alert là đã giải quyết
router.patch("/:id/resolve", markAlertAsResolved);

export default router;