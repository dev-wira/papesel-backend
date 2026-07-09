const express = require("express");
const router = express.Router();
const {
  signUp,
  verifyOtp,
  logIn,
  createClient,
  resendOTP,
  forgetPassword,
  resetPassword,
  deleteClient,
  logOut,
  getMyClients,
} = require("../controllers/user.controller");
const { asyncHandler } = require("../utils/asyncHandler");
const { requireAuth } = require("@clerk/express");
const { userAuth } = require("../middlewares/userAuth");
const { requireRole } = require("../middlewares/requireRole");

/**
 * @swagger
 * /user/signup:
 *   post:
 *     summary: Register a new dev account and send OTP for verification
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Rahul
 *               email:
 *                 type: string
 *                 example: rahul@example.com
 *               password:
 *                 type: string
 *                 example: securePass123
 *     responses:
 *       200:
 *         description: OTP sent to email
 *       400:
 *         description: User already exists
 */
router.post("/signup", asyncHandler(signUp));

/**
 * @swagger
 * /user/verify:
 *   post:
 *     summary: Verify OTP and activate the account
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: rahul@example.com
 *               otp:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: User verified, auth cookie set
 *       400:
 *         description: Invalid or expired OTP
 */
router.post("/verify", asyncHandler(verifyOtp));

/**
 * @swagger
 * /user/login:
 *   post:
 *     summary: Log in a user (dev or client)
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: rahul@example.com
 *               password:
 *                 type: string
 *                 example: securePass123
 *     responses:
 *       200:
 *         description: Login successful, auth cookie set
 *       400:
 *         description: Invalid email or password
 */
router.post("/login", asyncHandler(logIn));

/**
 * @swagger
 * /user/create-client:
 *   post:
 *     summary: Invite a new client (dev only)
 *     tags: [User]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Client Name
 *               email:
 *                 type: string
 *                 example: client@example.com
 *     responses:
 *       200:
 *         description: Client created and invite email sent
 *       400:
 *         description: Client with that email already exists
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Only devs can perform this action
 */
router.post(
  "/create-client",
  userAuth,
  requireRole("dev"),
  asyncHandler(createClient),
);

/**
 * @swagger
 * /user/resend-otp:
 *   get:
 *     summary: Resend OTP to a user's email
 *     tags: [User]
 *     parameters:
 *       - in: query
 *         name: email
 *         schema:
 *           type: string
 *         required: true
 *         example: rahul@example.com
 *     responses:
 *       200:
 *         description: OTP resent
 *       400:
 *         description: Email not found or cooldown active
 */
router.get("/resend-otp", asyncHandler(resendOTP));

/**
 * @swagger
 * /user/forgot-password:
 *   post:
 *     summary: Send a password reset link to the user's email
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: rahul@example.com
 *     responses:
 *       200:
 *         description: Reset email sent
 */
router.post("/forgot-password", asyncHandler(forgetPassword));

/**
 * @swagger
 * /user/update-password/{token}:
 *   patch:
 *     summary: Reset password using the token from the reset/invite email
 *     tags: [User]
 *     parameters:
 *       - in: path
 *         name: token
 *         schema:
 *           type: string
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               password:
 *                 type: string
 *                 example: newSecurePass123
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       400:
 *         description: Invalid or expired token
 */
router.patch("/update-password/:token", asyncHandler(resetPassword));

/**
 * @swagger
 * /user/delete-client/{client}:
 *   delete:
 *     summary: Delete a client invited by the authenticated dev
 *     tags: [User]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: client
 *         schema:
 *           type: string
 *         required: true
 *         description: Client's user ID
 *     responses:
 *       200:
 *         description: Client deleted
 *       400:
 *         description: No such client exists
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Only devs can perform this action
 */
router.delete(
  "/delete-client/:client",
  userAuth,
  requireRole("dev"),
  asyncHandler(deleteClient),
);

/**
 * @swagger
 * /user/log-out:
 *   post:
 *     summary: Log out the current user and clear the auth cookie
 *     tags: [User]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Logged out successfully
 *       401:
 *         description: Unauthorized
 */
router.post("/log-out", userAuth, asyncHandler(logOut));

/**
 * @swagger
 * /user/my-clients:
 *   get:
 *     summary: Get all clients invited by the authenticated dev
 *     tags: [User]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Clients fetched successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Only devs can perform this action
 */
router.get(
  "/my-clients",
  userAuth,
  requireRole("dev"),
  asyncHandler(getMyClients),
);

module.exports = router;
