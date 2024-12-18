const express = require('express');
const router = express.Router();
const flashcardSetController = require('../controllers/setController');
const { authenticate } = require('../middleware/authenticate');

// Route to flashcard sets.
router.get('/', authenticate, flashcardSetController.getAllFlashcardSets);
router.get('/:setId', authenticate, flashcardSetController.getFlashcardSetbyID);
router.post('/', authenticate, flashcardSetController.createFlashcardSet);
router.put('/:setId', authenticate, flashcardSetController.updateFlashcardSet);
router.delete('/:setId', authenticate, flashcardSetController.deleteFlashcardSet);
router.post('/:setId/comments', authenticate, flashcardSetController.addCommentToSet);
router.get('/:setId/comments', authenticate, flashcardSetController.getCommentsForSet);

module.exports = router;