const express = require("express");
const router = express.Router();
const {
  createProject,
  addRequirement,
  updateRequirement,
  getRequirements,
  getRequirementVersions,
  reviewRequirement,
  getPendingRequirements,
  getProjects,
} = require("../controllers/project.controller");
const { asyncHandler } = require("../utils/asyncHandler");
const { requireRole } = require("../middlewares/requireRole");
const { userAuth } = require("../middlewares/userAuth");

/**
 * @swagger
 * /project/create-project:
 *   post:
 *     summary: Create a new project for a verified client (dev only)
 *     description: |
 *       Client must already exist and be verified (invited via /user/create-client
 *       and have accepted the invite) before a project can be created for them.
 *     tags: [Project]
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
 *                 example: Portfolio Website
 *               client:
 *                 type: string
 *                 example: 6a4bcd5d3e3a7b796f4ab468
 *               description:
 *                 type: string
 *                 example: A responsive portfolio site with a blog section
 *     responses:
 *       200:
 *         description: Project created successfully
 *       400:
 *         description: Client does not exist, is unverified, or is not a client
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Only devs can perform this action
 */
router.post(
  "/create-project",
  userAuth,
  requireRole("dev"),
  asyncHandler(createProject),
);

/**
 * @swagger
 * /project/my-projects:
 *   get:
 *     summary: Get all projects belonging to the authenticated user
 *     tags: [Project]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Projects fetched successfully
 *       401:
 *         description: Unauthorized
 */
router.get("/my-projects", userAuth, asyncHandler(getProjects));

/**
 * @swagger
 * /project/add-requirement:
 *   post:
 *     summary: Add a new requirement to a project (client only)
 *     tags: [Project]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               project:
 *                 type: string
 *                 example: 6a4bcf6f3e3a7b796f4ab469
 *               title:
 *                 type: string
 *                 example: Add login page
 *               description:
 *                 type: string
 *                 example: Users should be able to log in with email and password
 *     responses:
 *       200:
 *         description: Requirement added
 *       400:
 *         description: No such project exists
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Only clients can perform this action
 */
router.post(
  "/add-requirement",
  userAuth,
  requireRole("client"),
  asyncHandler(addRequirement),
);

/**
 * @swagger
 * /project/update-requirement/{requirement}:
 *   patch:
 *     summary: Update a requirement (client only, blocked while pending review)
 *     description: |
 *       Cannot update a requirement while its status is "pending" — it must
 *       first be reviewed (approved/rejected) by the dev via /project/review-requirement/{requirement}.
 *     tags: [Project]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: requirement
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
 *               title:
 *                 type: string
 *                 example: Add login page with 2FA
 *               description:
 *                 type: string
 *                 example: Users should log in with email/password plus OTP
 *     responses:
 *       200:
 *         description: Requirement updated, previous version archived
 *       400:
 *         description: Requirement not found, or is pending review
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Only clients can perform this action
 */
router.patch(
  "/update-requirement/:requirement",
  userAuth,
  requireRole("client"),
  asyncHandler(updateRequirement),
);

/**
 * @swagger
 * /project/get-requirements/{project}:
 *   get:
 *     summary: Get all requirements for a project
 *     tags: [Project]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: project
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: Requirements fetched successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: No such project exists
 */
router.get(
  "/get-requirements/:project",
  userAuth,
  asyncHandler(getRequirements),
);

/**
 * @swagger
 * /project/get-requirement-versions/{requirement}:
 *   get:
 *     summary: Get version history of a requirement
 *     tags: [Project]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: requirement
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: Requirement versions fetched successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: No such requirement exists
 */
router.get(
  "/get-requirement-versions/:requirement",
  userAuth,
  asyncHandler(getRequirementVersions),
);

/**
 * @swagger
 * /project/review-requirement/{requirement}:
 *   patch:
 *     summary: Approve or reject a pending requirement (dev only)
 *     tags: [Project]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: requirement
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
 *               status:
 *                 type: string
 *                 example: approved
 *     responses:
 *       200:
 *         description: Requirement reviewed successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Only devs can perform this action
 *       404:
 *         description: Requirement not found
 */
router.patch(
  "/review-requirement/:requirement",
  userAuth,
  requireRole("dev"),
  asyncHandler(reviewRequirement),
);

/**
 * @swagger
 * /project/get-pending-requirements/{project}:
 *   get:
 *     summary: Get all requirements pending review for a project
 *     tags: [Project]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: project
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: Pending requirements fetched successfully
 *       401:
 *         description: Unauthorized
 */
router.get(
  "/get-pending-requirements/:project",
  userAuth,
  asyncHandler(getPendingRequirements),
);

module.exports = router;
