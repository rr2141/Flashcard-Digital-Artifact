const express = require('express');
const router = express.Router();
const flashcardController = require('../controllers/flashcardController');
const { authenticate } = require('../middleware/authenticate');

// Route to flashcards.
router.get('/', authenticate, flashcardController.getAllFlashcards);
router.post('/', authenticate, flashcardController.createFlashcard);
router.put('/:id', authenticate, flashcardController.updateFlashcard);
router.delete('/:id', authenticate, flashcardController.deleteFlashcard);
router.get('/set/:setId', authenticate, flashcardController.getFlashcardsInSet);

module.exports = router;