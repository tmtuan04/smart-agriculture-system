import express from "express";
import {
  getDecisionHistory,
  getLatestDecision,
  createDecision,
} from "../controllers/aiDecision.controller.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: AiDecision
 *     description: AI Decision Logs & History
 */

/**
 * @swagger
 * /device/{deviceId}/ai/history:
 *   get:
 *     summary: Get AI decision history for a device
 *     tags:
 *       - AiDecision
 *     parameters:
 *       - in: path
 *         name: deviceId
 *         required: true
 *         description: Device ID (string or ObjectId)
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         description: Page number
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         description: Number of records per page
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: List of AI decisions
 *       500:
 *         description: Internal server error
 */
router.get("/:deviceId/ai/history", getDecisionHistory);

/**
 * @swagger
 * /device/{deviceId}/ai/latest:
 *   get:
 *     summary: Get the most recent AI decision for a device
 *     tags:
 *       - AiDecision
 *     parameters:
 *       - in: path
 *         name: deviceId
 *         required: true
 *         description: Device ID (string or ObjectId)
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Latest AI decision
 *       404:
 *         description: No decision found
 *       500:
 *         description: Internal server error
 */
router.get("/:deviceId/ai/latest", getLatestDecision);

/**
 * @swagger
 * /device/{deviceId}/ai/decision:
 *   post:
 *     summary: Manually create an AI decision record (for testing/simulation)
 *     tags:
 *       - AiDecision
 *     parameters:
 *       - in: path
 *         name: deviceId
 *         required: true
 *         description: Device MongoDB ID
 *         schema:
 *           type: string
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
 *               context:
 *                 type: object
 *                 properties:
 *                   temperature:
 *                     type: number
 *                     example: 32.5
 *                   humidity:
 *                     type: number
 *                     example: 60
 *                   soilMoisture:
 *                     type: number
 *                     example: 25
 *     responses:
 *       201:
 *         description: Created successfully
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Device not found
 */
router.post("/:deviceId/ai/decision", createDecision);

export default router;
