const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

/**
 * @swagger
 * /api/auth/sync:
 *   post:
 *     summary: Synchronize Firebase User with Database
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - idToken
 *             properties:
 *               idToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: User synchronized successfully
 *       401:
 *         description: Invalid Firebase token
 */
router.post('/sync', authController.syncUser);

module.exports = router;
