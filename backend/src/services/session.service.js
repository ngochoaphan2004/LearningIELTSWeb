const prisma = require('../config/prisma');

const completeSession = async (userId, sessionId) => {
  const progress = await prisma.userSessionProgress.findFirst({
    where: { userId, sessionId },
    include: { session: true }
  });

  if (!progress || !progress.started_at) {
    throw new Error("Bạn chưa bắt đầu tính giờ cho phiên học này.");
  }

  const elapsedSeconds = (Date.now() - new Date(progress.started_at).getTime()) / 1000;
  const requiredSeconds = (progress.session.duration_minutes * 60) / 2;

  if (elapsedSeconds < requiredSeconds) {
    throw new Error("Bạn cần học tối thiểu 50% thời lượng của bài học để hoàn thành.");
  }

  // Update session status to COMPLETED
  await prisma.userSessionProgress.update({
    where: { id: progress.id },
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
