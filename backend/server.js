const express = require('express');
const app = express();

require('dotenv').config();  // Load environment variables

// Import routes
const flashcardRoutes = require('./routes/flashcards');
const usersRouter = require('./routes/users');

// Middleware to parse JSON bodies
app.use(express.json());

// Apply routes
app.use('/flashcard-sets', flashcardRoutes);
app.use('/users', usersRouter);

// Export app for testing
if (process.env.NODE_ENV !== 'test') {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
}

module.exports = app;
