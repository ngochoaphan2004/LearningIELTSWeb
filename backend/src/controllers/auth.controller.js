const authService = require('../services/auth.service');

const syncUser = async (req, res) => {
  try {
    const { idToken } = req.body;
    if (!idToken) {
      return res.status(400).json({ error: 'Missing idToken' });
    }

    // Cập nhật/Tạo mới User trong Database
    const user = await authService.syncUser(idToken);

    // Chỉ trả về thông tin User, KHÔNG set Cookie hay tạo JWT nào cả
    res.json({ message: 'User synchronized successfully', user });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
};

module.exports = { syncUser };
