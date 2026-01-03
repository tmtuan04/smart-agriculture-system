import express from "express";
import {
    getReports,
    getReportById,
    // getReportsByDevice,
    // generateDailyReport,
    // deleteReport,
} from "../controllers/report.controller.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Reports
 *   description: Daily sensor reports for devices
 */

/**
 * @swagger
 * /reports:
 *   get:
 *     summary: Get all reports
 *     tags: [Reports]
 *     parameters:
 *       - in: query
 *         name: deviceId
 *         schema:
 *           type: string
 *       - in: query
 *         name: from
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: to
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Reports retrieved successfully
 */
router.get("/", getReports);

/**
 * @swagger
 * /reports/{id}:
 *   get:
 *     summary: Get report by ID
 *     tags: [Reports]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Report ID (Mongo ObjectId)
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Report retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *       404:
 *         description: Report not found
 *       500:
 *         description: Internal server error
 */
router.get("/:id", getReportById);

// /**
//  * @swagger
//  * /reports/device/{deviceId}:
//  *   get:
//  *     summary: Get reports by device
//  *     tags: [Reports]
//  */
// router.get("/device/:deviceId", getReportsByDevice);

// /**
//  * @swagger
//  * /reports/generate:
//  *   post:
//  *     summary: Generate daily report for device
//  *     tags: [Reports]
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             required: [deviceId, date]
//  *             properties:
//  *               deviceId:
//  *                 type: string
//  *               date:
//  *                 type: string
//  *                 format: date
//  */
// router.post("/generate", generateDailyReport);

// /**
//  * @swagger
//  * /reports/{id}:
//  *   delete:
//  *     summary: Delete report
//  *     tags: [Reports]
//  */
// router.delete("/:id", deleteReport);

export default router;
