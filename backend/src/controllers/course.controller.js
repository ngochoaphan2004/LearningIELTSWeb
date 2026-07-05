const prisma = require('../config/prisma');

const getCourses = async (req, res) => {
  try {
    const courses = await prisma.course.findMany();
    res.json(courses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getCourseById = async (req, res) => {
  try {
    const course = await prisma.course.findUnique({
      where: { id: req.params.id },
      include: {
        sessions: {
          orderBy: { day_number: 'asc' }
        }
      }
    });
    if (!course) return res.status(404).json({ message: 'Course not found' });
    
    // Check if user is enrolled
    let is_enrolled = false;
    if (req.user && req.user.userId) {
      const enrollment = await prisma.userCourse.findUnique({
        where: {
          userId_courseId: {
            userId: req.user.userId,
            courseId: req.params.id
          }
        }
      });
      if (enrollment) is_enrolled = true;
    }
    
    res.json({ ...course, is_enrolled });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const enrollCourse = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id: courseId } = req.params;

    const existing = await prisma.userCourse.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId
        }
      }
    });

    if (existing) {
      return res.status(400).json({ message: 'User already enrolled in this course' });
    }

    const enrollment = await prisma.userCourse.create({
      data: {
        userId,
        courseId
      }
    });
    
    res.json({ message: 'Enrolled successfully', enrollment });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createCourse = async (req, res) => {
  try {
    const { title, description, total_days, focus_skill, total_duration, thumbnail_url } = req.body;
    const course = await prisma.course.create({
      data: {
        title,
        description,
        total_days,
        focus_skill,
        total_duration,
        thumbnail_url
      }
    });
    res.status(201).json(course);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getCourses,
  getCourseById,
  enrollCourse,
  createCourse
};
