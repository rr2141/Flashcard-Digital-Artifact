const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate } = require('../middleware/authenticate');

// Public routes (no authentication required)
router.post('/', userController.createUser); // POST /users - Create a new user
router.post('/login', userController.loginUser); // POST /users/login - Login user

// Protected routes (authentication required)
router.get('/:userId', authenticate, userController.getUserById); // GET /users/:userId - Fetch user by ID
router.put('/:userId', authenticate, userController.updateUserById); // PUT /users/:userId - Update user by ID


// User's Flashcard Sets
router.get('/:userId/sets', authenticate, userController.getUserFlashcardSets); // GET /users/:userId/sets - Fetch user's flashcard sets

// User's Collections
router.post('/:userId/collections',authenticate, userController.createCollection);
router.get('/:userId/collections/users', authenticate, userController.getUserCollections); // GET /users/:userId/collections - Fetch user's collections
router.get('/:userId/collections/:collectionId', authenticate, userController.getCollectionById); // GET /users/:userId/collections/:collectionId - Fetch collection by ID
router.put('/:userId/collections/:collectionId', authenticate, userController.updateCollectionById); // PUT /users/:userId/collections/:collectionId - Update collection by ID
router.delete('/:userId/collections/:collectionId', authenticate, userController.deleteCollectionById); // DELETE /users/:userId/collections/:collectionId - Delete collection by ID

module.exports = router;
