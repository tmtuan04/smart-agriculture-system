import express from "express"
import {
    getDeviceModeConfig,
    updateDeviceMode,
    updateManualConfig,
    updateAutoConfig,
    updateAIConfig,
} from "../controllers/deviceMode.controller.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: DeviceMode
 *   description: Manage device operating modes (manual / auto / ai)
 */

/**
 * @swagger
 * /device/{id}/mode-config:
 *   get:
 *     summary: Get current mode configuration of a device
 *     tags: [DeviceMode]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Device mode configuration
 *         content:
 *           application/json:
 *             example:
 *               deviceId: 6935513b52ef8c9bda001fcc
 *               mode: auto
 *               autoConfig:
 *                 schedule:
 *                   hour: 10
 *                   minute: 30
 *                 durationMinutes: 1
 *                 thresholds:
 *                   soilMin: 40
 *                   soilMax: 70
 *                 enabled: true
 */
router.get("/:id/mode-config", getDeviceModeConfig);

/**
 * @swagger
 * /device/{id}/mode:
 *   patch:
 *     summary: Change device operating mode
 *     tags: [DeviceMode]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Device ID
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - mode
 *             properties:
 *               mode:
 *                 type: string
 *                 enum: [manual, auto, ai]
 *                 example: auto
 *     responses:
 *       200:
 *         description: Mode updated successfully
 *       400:
 *         description: Invalid mode
 *       500:
 *         description: Internal server error
 */
router.patch("/:id/mode", updateDeviceMode);

/**
 * @swagger
 * /device/{id}/manual:
 *   patch:
 *     summary: Update manual mode thresholds
 *     tags: [DeviceMode]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Device ID
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               thresholds:
 *                 type: object
 *                 properties:
 *                   soilMin:
 *                     type: number
 *                     example: 30
 *                   soilMax:
 *                     type: number
 *                     example: 80
 *     responses:
 *       200:
 *         description: Manual configuration updated
 *       500:
 *         description: Internal server error
 */
router.patch("/:id/manual", updateManualConfig);

/**
 * @swagger
 * /device/{id}/auto:
 *   patch:
 *     summary: Update auto mode configuration
 *     tags: [DeviceMode]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Device ID (MongoDB ObjectId)
 *         schema:
 *           type: string
 *           example: 6935513b52ef8c9bda001fcc
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - schedule
 *               - thresholds
 *               - durationMinutes
 *               - enabled
 *             properties:
 *               schedule:
 *                 type: object
 *                 properties:
 *                   hour:
 *                     type: integer
 *                     example: 10
 *                   minute:
 *                     type: integer
 *                     example: 30
 *               thresholds:
 *                 type: object
 *                 properties:
 *                   soilMin:
 *                     type: number
 *                     example: 40
 *                   soilMax:
 *                     type: number
 *                     example: 70
 *               durationMinutes:
 *                 type: integer
 *                 example: 1
 *               enabled:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Auto configuration updated successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               config:
 *                 deviceId: 6935513b52ef8c9bda001fcc
 *                 mode: auto
 *                 autoConfig:
 *                   schedule:
 *                     hour: 10
 *                     minute: 30
 *                   thresholds:
 *                     soilMin: 40
 *                     soilMax: 70
 *                   durationMinutes: 1
 *                   enabled: true
 *       400:
 *         description: Invalid deviceId
 *       500:
 *         description: Internal server error
 */
router.patch("/:id/auto", updateAutoConfig);

/**
 * @swagger
 * /device/{id}/ai:
 *   patch:
 *     summary: Update AI mode configuration
 *     tags: [DeviceMode]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Device ID
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             enabled: true
 *             lastDecision: water
 *             confidence: 0.92
 *     responses:
 *       200:
 *         description: AI configuration updated
 *       500:
 *         description: Internal server error
 */
router.patch("/:id/ai", updateAIConfig);

export default router;
