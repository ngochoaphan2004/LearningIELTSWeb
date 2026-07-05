const { adminAuth } = require('../config/firebase');
const prisma = require('../config/prisma');

const syncUser = async (idToken) => {
  if (!adminAuth) {
    throw new Error("Firebase Admin is not initialized. Please add firebaseServiceAccount.json.");
  }

  // 1. Verify idToken via Firebase
  const decodedToken = await adminAuth.verifyIdToken(idToken);
  const { email, name, picture, uid } = decodedToken;

  if (!email) {
    throw new Error("Email not found in Google Account");
  }

  // 2. Update or create new User in Postgres DB
  let user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    user = await prisma.user.create({
      data: {
        id: uid,
        email,
        name: name || 'IELTS Learner',
        avatar_url: picture || '',
        current_level: 0,
        target_score: 0
      }
    });
  } else {
    // Update name/avatar if changed from Google
    user = await prisma.user.update({
      where: { email },
      data: {
        name: name || user.name,
        avatar_url: picture || user.avatar_url
      }
    });
  }

  return user;
};

module.exports = { syncUser };
