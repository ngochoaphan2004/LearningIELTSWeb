const prisma = require('../config/prisma');

const getUserDashboard = async (userId) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  
  const missedSessions = await prisma.userSessionProgress.findMany({
    where: { userId, status: 'MISSED' },
    include: { session: true }
  });

  const completedSessions = await prisma.userSessionProgress.count({
    where: { userId, status: 'COMPLETED' }
  });

  return {
    streak: completedSessions, // Simple streak calculation logic
    missed_sessions: missedSessions,
    user_info: user
  };
};

module.exports = { getUserDashboard };
