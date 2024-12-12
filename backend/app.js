// app.js
const express = require('express');
require('dotenv').config(); 

const cors = require('cors');
const flashcardRoutes = require("./routes/flashcards");
const flashcardSetRoutes = require('./routes/flashcardSets');
const userRoutes = require("./routes/users");
const adminRoutes = require("./routes/admins");
const collectionsRoutes = require('./routes/collections');

const app = express();

// Enable CORS if the frontend and backend are on different ports
app.use(cors({
    origin: 'http://localhost:3003',  
    methods: 'GET,POST,PUT,DELETE',
    allowedHeaders: 'Content-Type,Authorization',
}));

// Middleware to parse JSON bodies
app.use(express.json());

// Apply the routes
app.use('/api/flashcards', flashcardRoutes);
app.use('/api/flashcardSets', flashcardSetRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admins', adminRoutes);
app.use('/api/collections', collectionsRoutes);

module.exports = app;