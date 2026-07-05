const prisma = require('../config/prisma');
const sessionService = require('../services/session.service');

const getSessionById = async (req, res) => {
  try {
    const session = await prisma.studySession.findUnique({
      where: { id: req.params.id },
      include: {
        course: true
      }
    });
    if (!session) return res.status(404).json({ message: 'Session not found' });
    res.json(session);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const completeSession = async (req, res) => {
  try {
    const { sessionId } = req.body;
    const userId = req.user.userId;
    
    if (!userId || !sessionId) return res.status(400).json({ error: "Missing userId or sessionId" });

    const progress = await sessionService.completeSession(userId, sessionId);
    res.json({ message: "Session completed successfully", progress });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getSessionById, completeSession };
