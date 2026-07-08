const notebookService = require('../services/notebook.service');

const getVocabularyNotebook = async (req, res) => {
  try {
    const { page, limit, search, startDate, endDate, sortBy } = req.query;
    const result = await notebookService.getVocabularyNotebook(req.user.userId, page, limit, search, startDate, endDate, sortBy);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getErrorLogNotebook = async (req, res) => {
  try {
    const { page, limit, search, startDate, endDate, sortBy } = req.query;
    const result = await notebookService.getErrorLogNotebook(req.user.userId, page, limit, search, startDate, endDate, sortBy);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getDictationNotebook = async (req, res) => {
  try {
    const { page, limit, search, startDate, endDate, sortBy } = req.query;
    const result = await notebookService.getDictationNotebook(req.user.userId, page, limit, search, startDate, endDate, sortBy);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getVocabularyNotebook,
  getErrorLogNotebook,
  getDictationNotebook
};
