const prisma = require('../config/prisma');
const sessionService = require('../services/session.service');

const getSessionById = async (req, res) => {
  try {
    const session = await prisma.studySession.findUnique({
      where: { id: req.params.id },
      include: {
        course: true,
        userProgress: req.user ? { where: { userId: req.user.userId } } : false
      }
    });
    if (!session) return res.status(404).json({ message: 'Session not found' });
    
    // Format the response to easily access started_at
    let startedAt = null;
    if (session.userProgress && session.userProgress.length > 0) {
      startedAt = session.userProgress[0].started_at;
    }
    
    res.json({ ...session, started_at: startedAt });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const startSession = async (req, res) => {
  try {
    const sessionId = req.params.id;
    const userId = req.user.userId;
    
    if (!userId || !sessionId) return res.status(400).json({ error: "Missing userId or sessionId" });

    // Find if progress already exists
    let progress = await prisma.userSessionProgress.findFirst({
      where: { userId, sessionId }
    });

    if (!progress) {
      progress = await prisma.userSessionProgress.create({
        data: {
          userId,
          sessionId,
          status: 'IN_PROGRESS',
          scheduled_date: new Date(),
          started_at: new Date()
        }
      });
    } else {
      progress = await prisma.userSessionProgress.update({
        where: { id: progress.id },
        data: {
          status: 'IN_PROGRESS',
          started_at: progress.started_at || new Date() // Only set started_at if not already set
        }
      });
    }
    
    res.json({ message: "Session started", progress });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const completeSession = async (req, res) => {
  try {
    const { sessionId, notebookData } = req.body;
    const userId = req.user.userId;
    
    if (!userId || !sessionId) return res.status(400).json({ error: "Missing userId or sessionId" });

    const progress = await sessionService.completeSession(userId, sessionId, notebookData);
    res.json({ message: "Session completed successfully", progress });
  } catch (error) {
    if (error.message.includes("tối thiểu 50%") || error.message.includes("chưa bắt đầu")) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
};

const resetSession = async (req, res) => {
  try {
    const sessionId = req.params.id;
    const userId = req.user.userId;
    
    if (!userId || !sessionId) return res.status(400).json({ error: "Missing userId or sessionId" });

    // Find progress
    let progress = await prisma.userSessionProgress.findFirst({
      where: { userId, sessionId }
    });

    if (progress) {
      progress = await prisma.userSessionProgress.update({
        where: { id: progress.id },
        data: {
          started_at: null
        }
      });
    }
    
    res.json({ message: "Session timer reset", progress });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getSessionById, startSession, completeSession, resetSession };
