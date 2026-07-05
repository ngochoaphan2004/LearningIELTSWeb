const prisma = require('../config/prisma');

const completeSession = async (userId, sessionId) => {
  // Update session status to COMPLETED
  const progress = await prisma.userSessionProgress.updateMany({
    where: { userId, sessionId },
    data: { status: 'COMPLETED', completed_at: new Date() }
  });

  const session = await prisma.studySession.findUnique({ where: { id: sessionId } });

  // Create a notification to push to the Community Feed
  if (session) {
    await prisma.feedActivity.create({
      data: {
        userId,
        action_type: 'COMPLETED_SESSION',
        content: `vừa xuất sắc hoàn thành: ${session.title}`
      }
    });
  }

  return progress;
};

module.exports = { completeSession };
