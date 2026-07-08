const express = require('express');
const router = express.Router();
const notebookController = require('../controllers/notebook.controller');
const authMiddleware = require('../middlewares/auth.middleware');

router.use(authMiddleware);

router.get('/vocabulary', notebookController.getVocabularyNotebook);
router.get('/errors', notebookController.getErrorLogNotebook);
router.get('/dictation', notebookController.getDictationNotebook);

module.exports = router;
