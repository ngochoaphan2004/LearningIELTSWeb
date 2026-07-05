const userService = require('../services/user.service');

const getDashboard = async (req, res) => {
  try {
    const userId = req.user.userId; 
    if (!userId) return res.status(401).json({ error: "Missing userId in token" });

    const data = await userService.getUserDashboard(userId);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getDashboard };
