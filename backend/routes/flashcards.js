
//Initialising
const express = require('express');
const router = express.Router();
const controller = require('../controllers/flashcardController');

//Route to fetch ALL flashcards
router.get('/', flashcardController.getAllFlashcards);

//Route to create a new flashcard
router.post('/', flashcardController.createFlashcard);

//Route to delete a flashcard by using ID 
router.delete('/:id', flashcardController.deleteFlashcard);

//Route to update flashcard by using ID 
router.put('/:id', flashcardController.updateFlashcard);

module.exports = router;



