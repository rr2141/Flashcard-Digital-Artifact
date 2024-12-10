const express = require('express');
const router = express.Router();
const { isAdmin } = require('../middleware/admin');
const { authenticate } = require('../middleware/authenticate');
const adminController = require('../controllers/adminsController');

// Admin dashboard (protected route)
router.get('/dashboard', authenticate, isAdmin, adminController.getAdminDashboard);

// Fetch all users (protected route)
router.get('/', authenticate, isAdmin,  adminController.getAllUsers);

// Delete a user by ID (protected route)
router.delete('/delete/:userId', authenticate, isAdmin, adminController.deleteUserById);

module.exports = router;
