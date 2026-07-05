const prisma = require('../config/prisma');

const getCommunityFeed = async () => {
  return await prisma.feedActivity.findMany({
    orderBy: { created_at: 'desc' },
    take: 20,
    include: {
      user: {
        select: { name: true, avatar_url: true }
      }
    }
  });
};

module.exports = { getCommunityFeed };
