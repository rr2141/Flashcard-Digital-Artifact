const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate } = require('../middleware/authenticate');

// Public routes (no authentication required)
router.post('/', userController.createUser);
router.post('/login', userController.loginUser); 

// Protected routes (authentication required)
router.get('/:userId', authenticate, userController.getUserById); 
router.put('/:userId', authenticate, userController.updateUserById); 
router.put('/:userId/password', authenticate, userController.updatePassword); 
router.get('/:userId/sets', authenticate, userController.getUserFlashcardSets); 


module.exports = router;
