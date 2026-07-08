const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const feedRoutes = require('./feed.routes');
const sessionRoutes = require('./session.routes');
const courseRoutes = require('./course.routes');
const uploadRoutes = require('./upload.routes');
const notebookRoutes = require('./notebook.routes');

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/feed', feedRoutes);
router.use('/sessions', sessionRoutes);
router.use('/courses', courseRoutes);
router.use('/upload', uploadRoutes);
router.use('/notebooks', notebookRoutes);

module.exports = router;
