const express = require('express');
const router = express.Router();
const { isAdmin } = require('../middleware/admin');
const { authenticate } = require('../middleware/authenticate');
const adminController = require('../controllers/adminsController');

// Fetch all users (protected route)
router.get('/', authenticate, isAdmin,  adminController.getAllUsers);

// Delete a user by ID (protected route)
router.delete('/delete/:userId', authenticate, isAdmin, adminController.deleteUserById);

// Get current set creation limit (protected route)
router.get('/set-limit', authenticate, isAdmin, adminController.getSetLimit);

// Update set creation limit (protected route)
router.put('/set-limit', authenticate, isAdmin, adminController.updateSetLimit);

module.exports = router;
