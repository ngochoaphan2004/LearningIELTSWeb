const prisma = require('../config/prisma');

const getUserDashboard = async (userId) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  
  let userCourse = await prisma.userCourse.findFirst({
    where: { userId },
    include: { course: true }
  });

  // Get all user progress to color the Calendar
  const progress = await prisma.userSessionProgress.findMany({
    where: { userId },
    include: { session: true }
  });

  const completedSessions = progress.filter(p => p.status === 'COMPLETED');
  const missedSessions = progress.filter(p => p.status === 'MISSED');

  // Find the next session (uncompleted session with smallest day_number)
  let nextSession = null;
  if (userCourse) {
    const completedSessionIds = completedSessions.map(p => p.sessionId);
    nextSession = await prisma.studySession.findFirst({
      where: {
        courseId: userCourse.courseId,
        id: { notIn: completedSessionIds }
      },
      orderBy: { day_number: 'asc' }
    });
  }

  // Simulate current Streak using total completed sessions
  const myStreak = completedSessions.length;

  return {
    streak: myStreak,
    completed_sessions: completedSessions,
    missed_sessions: missedSessions,
    next_session: nextSession,
    user_info: user,
    current_course: userCourse ? userCourse.course : null
  };
};

const getLeaderboard = async () => {
  // Get list of users with total completed sessions
  const users = await prisma.user.findMany({
    include: {
      _count: {
        select: { sessionProgress: { where: { status: 'COMPLETED' } } }
      }
    }
  });

  const leaderboard = users.map(u => ({
    id: u.id,
    user: u.name,
    avatar: u.name.charAt(0).toUpperCase(),
    streak: u._count.sessionProgress, 
    maxStreak: u._count.sessionProgress,
    totalSessions: u._count.sessionProgress
  }));

  // Sort descending by completed sessions
  leaderboard.sort((a, b) => b.streak - a.streak);

  // Get Top 50
  return leaderboard.slice(0, 50);
};

const getMyCourses = async (userId) => {
  const enrollments = await prisma.userCourse.findMany({
    where: { userId },
    include: { course: true }
  });
  return enrollments.map(e => e.course);
};

module.exports = { getUserDashboard, getLeaderboard, getMyCourses };
