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

module.exports = router;
