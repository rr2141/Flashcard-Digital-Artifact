// In your main Express app (e.g., app.js)
const express = require('express');
require('dotenv').config();  // Load environment variables from .env file

const cors = require('cors');
const app = express();
const flashcardRoutes = require("./routes/flashcards"); // Correct path to your routes file
const userRoutes = require("./routes/users")
const adminRoutes = require("./routes/admins")

// Enable CORS if the frontend and backend are on different ports
app.use(cors({
    origin: 'http://localhost:3002',  // Change to your frontend URL
    methods: 'GET,POST,PUT,DELETE',
    allowedHeaders: 'Content-Type,Authorization',
  }));

// Middleware to parse JSON bodies
app.use(express.json());

// Apply the flashcard routes
app.use('/api/flashcards', flashcardRoutes); // Prefix the routes with /api
app.use('/api/users',userRoutes);
app.use('/api/admins',adminRoutes);

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

