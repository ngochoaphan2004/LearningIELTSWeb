const feedService = require('../services/feed.service');

const getFeed = async (req, res) => {
  try {
    const activities = await feedService.getCommunityFeed();
    res.json(activities);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getFeed };
