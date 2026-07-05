const express = require('express');
const router = express.Router();
const feedController = require('../controllers/feed.controller');

/**
 * @swagger
 * /api/feed:
 *   get:
 *     summary: Get the community feed
 *     tags: [Feed]
 *     responses:
 *       200:
 *         description: A list of 20 most recent feed activities
 *       500:
 *         description: Internal server error
 */
router.get('/', feedController.getFeed);

module.exports = router;
