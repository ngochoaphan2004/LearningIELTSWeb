const adminAuth = require('../config/firebase');
const prisma = require('../config/prisma');

const authMiddleware = async (req, res, next) => {
  // Lấy Bearer Token từ Header
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: No Firebase token provided in Authorization header' });
  }

  const token = authHeader.split(' ')[1];

  try {
    if (!adminAuth) {
        throw new Error('Firebase Admin not initialized. Cannot verify token.');
    }
    
    // 1. Xác thực Token bằng Firebase
    const decodedToken = await adminAuth.verifyIdToken(token);
    const email = decodedToken.email;

    // 2. Tìm User trong DB
    const user = await prisma.user.findUnique({ where: { email } });
    
    // Nếu User chưa tồn tại trong DB, yêu cầu Frontend gọi API /sync trước
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized: User not found in database. Please sync first.' });
    }

    // 3. Gắn thông tin User vào Request
    req.user = { userId: user.id, email: user.email };
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Unauthorized: Invalid or expired Firebase token', details: error.message });
  }
};

module.exports = authMiddleware;
