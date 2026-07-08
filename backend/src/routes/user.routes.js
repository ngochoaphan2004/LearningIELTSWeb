const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const authMiddleware = require('../middlewares/auth.middleware');

/**
 * @swagger
 * /api/users/me/dashboard:
 *   get:
 *     summary: Get user dashboard information
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Dashboard data including streak, missed sessions, and user info
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/me/dashboard', authMiddleware, userController.getDashboard);
router.get('/:id/dashboard', authMiddleware, userController.getUserDashboardById);

/**
 * @swagger
 * /api/users/leaderboard:
 *   get:
 *     summary: Get leaderboard
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Leaderboard array
 */
router.get('/leaderboard', authMiddleware, userController.getLeaderboard);

/**
 * @swagger
 * /api/users/me/courses:
 *   get:
 *     summary: Get user's enrolled courses
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Array of enrolled courses
 */
router.get('/me/courses', authMiddleware, userController.getMyCourses);

module.exports = router;
