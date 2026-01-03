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
 *         description: Device ID
 *         schema:
 *           type: string
 *           example: 6935513b52ef8c9bda001fcc
 *     responses:
 *       200:
 *         description: Device mode configuration
 *         content:
 *           application/json:
 *             example:
 *               deviceId: 6935513b52ef8c9bda001fcc
 *               mode: manual
 *               manualConfig:
 *                 isPumpOn: true
 *                 startedAt: "2025-12-14T10:00:00Z"
 *                 thresholds:
 *                   soilMin: 30
 *                   soilMax: 80
 *       404:
 *         description: Mode config not found
 *       500:
 *         description: Internal server error
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
 *     summary: Update manual mode configuration
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
 *             isPumpOn: true
 *             startedAt: "2025-12-14T10:00:00Z"
 *             stoppedAt: null
 *             thresholds:
 *               soilMin: 30
 *               soilMax: 80
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
 *         description: Device ID
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             schedule:
 *               hour: 6
 *               minute: 30
 *             duration: 15
 *             thresholds:
 *               soilMin: 40
 *               soilMax: 75
 *             enabled: true
 *     responses:
 *       200:
 *         description: Auto configuration updated
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
