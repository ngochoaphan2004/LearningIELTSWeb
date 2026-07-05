const express = require('express');
const router = express.Router();
const sessionController = require('../controllers/session.controller');
const authMiddleware = require('../middlewares/auth.middleware');

/**
 * @swagger
 * /api/sessions/complete:
 *   post:
 *     summary: Mark a session as completed
 *     tags: [Sessions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - sessionId
 *             properties:
 *               sessionId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Session completed successfully
 *       400:
 *         description: Missing sessionId
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post('/complete', authMiddleware, sessionController.completeSession);

/**
 * @swagger
 * /api/sessions/{id}:
 *   get:
 *     summary: Lấy chi tiết buổi học
 *     tags: [Sessions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Trả về thông tin buổi học
 */
router.get('/:id', authMiddleware, sessionController.getSessionById);

module.exports = router;
