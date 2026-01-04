import express from "express";
import { activateAIMode } from "../controllers/aiPump.controller.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: AIPump
 *     description: AI Pump configuration and triggering
 */

/**
 * @swagger
 * /device/{id}/ai/pump:
 *   post:
 *     tags:
 *       - AIPump
 *     summary: Enable AI Mode for a device and trigger immediate check
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Device MongoDB ID
 *         schema:
 *           type: string
 *           example: 6935513b52ef8c9bda001fcc
 *     responses:
 *       200:
 *         description: AI Mode activated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Device switched to AI Mode. AI Check initiated.
 *                 confidenceScore:
 *                   type: number
 *                   format: float
 *                   example: 0.85
 *                 actionTaken:
 *                   type: string
 *                   example: ON
 *       404:
 *         description: Device not found
 *       500:
 *         description: Internal server error
 */
router.post("/:id/ai/pump", activateAIMode);

export default router;
