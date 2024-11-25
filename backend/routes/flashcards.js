const express = require('express');
const router = express.Router();
const flashcardController = require('../controllers/flashcardController');
const { authenticate } = require('../middleware/authenticate');

// Route to fetch ALL flashcards (should use GET)
router.get('/', flashcardController.getAllFlashcards);  // GET to fetch all flashcards

// Route to get a flashcard set by ID (should use GET)
router.get('/:setId', flashcardController.getFlashcardSetbyID);  // GET to fetch a set by ID

// Route to create a new flashcard set (should use POST)
router.post('/', flashcardController.createFlashcardSet);  // POST to create a flashcard set

// Route to create a new flashcard (should use POST)
router.post('/flashcard', flashcardController.createFlashcard);  // POST to create a flashcard

// Route to delete a flashcard by ID (should use DELETE)
router.delete('/:id', flashcardController.deleteFlashcard);  // DELETE to remove a flashcard

// Route to update a flashcard set by ID (should use PUT)
router.put('/:id', flashcardController.updateFlashcardSet);  // PUT to update a flashcard set

// Route to add a comment to a flashcard set (should use POST)
router.post('/set/:setID/comment', flashcardController.addCommentToSet);  // POST to add a comment to a flashcard set

// Route to get all flashcards in a specific set (should use GET)
router.get('/sets/:setId/cards', flashcardController.getFlashcardsInSet);  // GET to get all cards in a flashcard set

module.exports = router;
