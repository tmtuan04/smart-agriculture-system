import express from "express"
import { getMyProfile, login, logout, signup } from "../controllers/auth.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication endpoints (JWT for mobile)
 *
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: User login
 *     tags: [Auth]
 *     description: Authenticate user using email + password and return a JWT token (mobile stores in Secure Storage).
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: test@gmail.com
 *               password:
 *                 type: string
 *                 example: 123456
 *     responses:
 *       200:
 *         description: Login successful (JWT token returned)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   example: 67ac1234ef901234abcd5678
 *                 email:
 *                   type: string
 *                   example: user@example.com
 *                 fullName:
 *                   type: string
 *                   example: User Example
 *                 token:
 *                   type: string
 *                   description: JWT token for mobile Secure Storage
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       400:
 *         description: Invalid Credentials
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid Credentials
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /auth/signup:
 *   post:
 *     summary: User registration (mobile)
 *     tags: [Auth]
 *     description: Create a new user account. Returns user info and JWT token for mobile Secure Storage.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fullName
 *               - email
 *               - password
 *             properties:
 *               fullName:
 *                 type: string
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 example: Password123
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   example: 67ac1234ef901234abcd5678
 *                 fullName:
 *                   type: string
 *                   example: John Doe
 *                 email:
 *                   type: string
 *                   example: user@example.com
 *                 token:
 *                   type: string
 *                   description: JWT token for mobile Secure Storage
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *
 *       400:
 *         description: Validation error or email already exists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Email already exists
 *
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout user
 *     tags: [Auth]
 *     description: Mobile app should remove the stored JWT token. Backend only returns success message.
 *     responses:
 *       200:
 *         description: Logout Successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Logout Successful
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Get current user's profile
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     description: Retrieve the currently authenticated user's info. Password is excluded.
 *     responses:
 *       200:
 *         description: Current user profile
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   example: 67ac1234ef901234abcd5678
 *                 fullName:
 *                   type: string
 *                   example: John Doe
 *                 email:
 *                   type: string
 *                   example: user@example.com
 *                 profilePic:
 *                   type: string
 *                   example: https://example.com/avatar.jpg
 *                 createdAt:
 *                   type: string
 *                   example: 2025-12-01T13:45:00.000Z
 *                 updatedAt:
 *                   type: string
 *                   example: 2025-12-01T13:45:00.000Z
 *       401:
 *         description: Unauthorized (invalid or missing token)
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal Server Error
 */

router.post("/signup", signup)
router.post("/login", login)
router.post("/logout", logout)
router.get("/me", authenticate, getMyProfile)

export default router;