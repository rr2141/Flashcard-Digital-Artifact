const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate } = require('../middleware/authenticate');

// Middleware for protecting routes (add it where necessary)
router.use(authenticate);

// Users
router.get('/', userController.getAllUsers); // GET /users - Fetch all users
router.post('/', userController.createUser); // POST /users - Create a new user

// User by ID
router.get('/:userId', userController.getUserById); // GET /users/:userId - Fetch user by ID
router.put('/:userId', userController.updateUserById); // PUT /users/:userId - Update user by ID
router.delete('/:userId', userController.deleteUserById); // DELETE /users/:userId - Delete user by ID

// User's Flashcard Sets
router.get('/:userId/sets', userController.getUserFlashcardSets); // GET /users/:userId/sets - Fetch user's flashcard sets

// User's Collections
router.get('/:userId/collections', userController.getUserCollections); // GET /users/:userId/collections - Fetch user's collections

// Specific Collection
router.get('/:userId/collections/:collectionId', userController.getCollectionById); // GET /users/:userId/collections/:collectionId - Fetch collection by ID
router.put('/:userId/collections/:collectionId', userController.updateCollectionById); // PUT /users/:userId/collections/:collectionId - Update collection by ID
router.delete('/:userId/collections/:collectionId', userController.deleteCollectionById); // DELETE /users/:userId/collections/:collectionId - Delete collection by ID

module.exports = router;
