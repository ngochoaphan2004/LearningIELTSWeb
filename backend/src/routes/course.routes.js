const express = require('express');
const { getCourses, getCourseById, enrollCourse, createCourse } = require('../controllers/course.controller');
const authMiddleware = require('../middlewares/auth.middleware');

const router = express.Router();

/**
 * @swagger
 * /api/courses:
 *   get:
 *     summary: Lấy danh sách khóa học
 *     tags: [Courses]
 *     responses:
 *       200:
 *         description: Trả về danh sách khóa học
 *   post:
 *     summary: Tạo khóa học mới (Admin)
 *     tags: [Courses]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               total_days:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Đã tạo
 */
router.get('/', authMiddleware, getCourses);
router.post('/', authMiddleware, createCourse);

/**
 * @swagger
 * /api/courses/{id}:
 *   get:
 *     summary: Lấy chi tiết khóa học và danh sách buổi học
 *     tags: [Courses]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Thành công
 */
router.get('/:id', authMiddleware, getCourseById);

/**
 * @swagger
 * /api/courses/{id}/enroll:
 *   post:
 *     summary: Đăng ký khóa học
 *     tags: [Courses]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Đăng ký thành công
 */
router.post('/:id/enroll', authMiddleware, enrollCourse);

module.exports = router;
