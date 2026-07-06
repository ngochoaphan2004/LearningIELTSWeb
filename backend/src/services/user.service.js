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

  // Lấy lịch sử FeedActivity để tô màu chính xác trên lịch (mỗi lần học là 1 record)
  const activities = await prisma.feedActivity.findMany({
    where: { 
      userId,
      action_type: 'COMPLETED_SESSION'
    },
    orderBy: { created_at: 'desc' }
  });

  return {
    streak: user.current_streak || 0,
    total_completed: completedSessions.length,
    completed_sessions: completedSessions,
    study_activities: activities, // Dùng mảng này cho Lịch
    missed_sessions: missedSessions,
    next_session: nextSession,
    user_info: user,
    current_course: userCourse ? userCourse.course : null
  };
};

const getLeaderboard = async () => {
  // Get list of users ordered by max_streak and current_streak
  const users = await prisma.user.findMany({
    orderBy: [
      { current_streak: 'desc' }
    ],
    take: 50,
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
    streak: u.current_streak || 0, 
    maxStreak: u.max_streak || 0,
    totalSessions: u._count.sessionProgress || 0
  }));

  return leaderboard;
};

const getMyCourses = async (userId) => {
  const enrollments = await prisma.userCourse.findMany({
    where: { userId },
    include: { course: true }
  });
  return enrollments.map(e => e.course);
};

module.exports = { getUserDashboard, getLeaderboard, getMyCourses };
