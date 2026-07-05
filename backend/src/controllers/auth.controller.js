const authService = require('../services/auth.service');

const syncUser = async (req, res) => {
  try {
    const { idToken } = req.body;
    if (!idToken) {
      return res.status(400).json({ error: 'Missing idToken' });
    }

    // Update/Create User in Database
    const user = await authService.syncUser(idToken);

    // Only return User info, DO NOT set Cookie or create any JWT
    res.json({ message: 'User synchronized successfully', user });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
};

module.exports = { syncUser };
