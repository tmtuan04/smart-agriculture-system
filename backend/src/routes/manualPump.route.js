import express from "express";
import { controlManualPump } from "../controllers/manualPump.controller.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: ManualPump
 *   description: Manual pump control via MQTT
 */

/**
 * @swagger
 * /device/{id}/manual/pump:
 *   post:
 *     summary: Control pump manually (ON / OFF)
 *     tags: [ManualPump]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Device MongoDB ID
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
 *               - action
 *             properties:
 *               action:
 *                 type: string
 *                 enum: [on, off]
 *                 example: on
 *     responses:
 *       200:
 *         description: Pump control command sent successfully
 *         content:
 *           application/json:
 *             example:
 *               message: Pump turned on
 *               success: true
 *       400:
 *         description: Invalid request or device not found
 *         content:
 *           application/json:
 *             example:
 *               message: Invalid pump action
 *       500:
 *         description: Internal server error
 */
router.post("/:id/manual/pump", controlManualPump);

export default router;
