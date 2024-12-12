const prisma = require('../prisma');
const bcrypt = require('bcryptjs');
//const { parse } = require('dotenv');
const jwt = require('jsonwebtoken');

// Get the secret from environment variables
const jwtSecret = process.env.JWT_SECRET_KEY;

if (!jwtSecret) {
    console.error('JWT secret is missing');
    process.exit(1);  
  }
  
  /// Login user
  const loginUser = async (req, res) => {
    const { username, password } = req.body;
  
    if (!username || !password) {
      console.log("Missing username or password");
      return res.status(400).json({ error: 'Username and password are required' });
    }
    
    try {
  
      const user = await prisma.user.findUnique({
        where: { username },
      });
  
      if (!user) {
        console.log("User not found:", username);
        return res.status(404).json({ error: 'Invalid username or password' }); // Avoid revealing whether username or password is incorrect
      }
      
      const isPasswordValid = await bcrypt.compare(password, user.password);
  
      if (!isPasswordValid) {
        console.error('Login failed due to invalid password', { username });
        return res.status(401).json({ error: 'Invalid username or password' }); // Avoid revealing which field is wrong
      }
  
      const token = jwt.sign(
        { id: user.id, username: user.username, admin: user.admin },
        jwtSecret, 
        { expiresIn: '24h' } 
      );
  
      return res.status(200).json({
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          username: user.username,
          admin: user.admin,
        },
      });
    } catch (error) {
      console.error('Error during login:', error);  
      return res.status(500).json({ error: 'Internal server error' });  
    }
  };  

  // Create new user
  const createUser = async (req, res) => {
    const { username, password, admin } = req.body;
  

    if (!username || !password) {
      return res.status(400).json({ error: "Username and password are required" });
    }
  
    const usernameRegex = /^[a-zA-Z0-9_]{3,30}$/; 
    const passwordMinLength = 6; 
  
    if (!usernameRegex.test(username) || password.length < passwordMinLength) {
      return res.status(400).json({ error: "Invalid username or password format" });
    }
  
    try {
      const hashedPassword = await bcrypt.hash(password, 10); 
  
      const newUser = await prisma.user.create({
        data: {
          username,
          password: hashedPassword,
          admin: admin || false,
        },
      });
  
      res.status(201).json({
        message: 'User created successfully',
        user: {
          id: newUser.id,
          username: newUser.username,
          admin: newUser.admin,
        },
      });
    } catch (error) {
      if (error.code === 'P2002') { 
        return res.status(409).json({ error: 'Username already exists' });
      }
      console.error('Error creating user:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  // Get the user by ID
  const getUserById = async (req, res) => {
    const { userId } = req.params;

    if (isNaN(userId) || parseInt(userId) < 0) {
        return res.status(400).json({ error: 'Invalid user ID format' });
    }

    try {
        const user = await prisma.user.findUnique({
            where: { id: parseInt(userId) },
            select: {
                id: true,
                username: true,
                admin: true,
            },
        });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
    };
    
    // Update the user by ID
    const updateUserById = async (req, res) => {
      const { userId } = req.params;
      const { username, password, admin } = req.body;

      try {
 
        const user = await prisma.user.findUnique({
            where: { id: parseInt(userId) },
        });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        if (admin !== undefined && !req.user.admin) {
            return res.status(403).json({ error: "You are not allowed to update admin status" });
        }

        const updatedUser = await prisma.user.update({
            where: { id: parseInt(userId) },
            data: {
                username: username || user.username,
                password: password || user.password, 
                admin: admin !== undefined ? admin : user.admin,
            },
        });

        res.status(200).json(updatedUser);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

  // Get the user's flashcard sets
  const getUserFlashcardSets = async (req, res) => {
    const { userId } = req.params;

    if (isNaN(userId) || parseInt(userId) < 0) {
        return res.status(400).json({ error: 'Invalid user ID format' });
    }
    try {
        const user = await prisma.user.findUnique({
            where: { id: parseInt(userId) },
        });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const sets = await prisma.flashcardSet.findMany({
            where: { userId: parseInt(userId) },
            include: {
                cards: true,
            },
        });

        res.status(200).json(sets);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
  };

  // Update the user's password
  const updatePassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id; 
  
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });
  
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ error: "Current password is incorrect" });
      }
  
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);
  
      await prisma.user.update({
        where: { id: userId },
        data: { password: hashedPassword },
      });
  
      res.status(200).json({ message: "Password updated successfully" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
 };

module.exports = {
    createUser,
    loginUser,
    getUserById,
    updateUserById,
    getUserFlashcardSets,
    updatePassword
};
