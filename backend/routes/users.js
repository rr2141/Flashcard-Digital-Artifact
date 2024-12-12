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

router.put('/:userId/password', userController.updatePassword); // PUT /users/:userId/password - Update user password

// User's Flashcard Sets
router.get('/:userId/sets', authenticate, userController.getUserFlashcardSets); // GET /users/:userId/sets - Fetch user's flashcard sets


module.exports = router;
