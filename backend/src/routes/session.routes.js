const express = require('express');
const router = express.Router();
const sessionController = require('../controllers/session.controller');
const authMiddleware = require('../middlewares/auth.middleware');

/**
 * @swagger
 * /api/sessions/{id}/start:
 *   post:
 *     summary: Start a study session (mark as IN_PROGRESS and set started_at)
 *     tags: [Sessions]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: Session started successfully
 */
router.post('/:id/start', authMiddleware, sessionController.startSession);

/**
 * @swagger
 * /api/sessions/{id}/reset:
 *   post:
 *     summary: Reset a study session timer
 *     tags: [Sessions]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: Session timer reset successfully
 */
router.post('/:id/reset', authMiddleware, sessionController.resetSession);

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
