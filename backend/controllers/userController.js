const prisma = require('../prisma');
const bcrypt = require('bcryptjs');
const { parse } = require('dotenv');
const jwt = require('jsonwebtoken');
// Get the secret from environment variables
const jwtSecret = process.env.JWT_SECRET_KEY;

if (!jwtSecret) {
    console.error('JWT secret is missing');
    process.exit(1);  // Exit the process if the secret is not found
  }
  
  /// Handle User Login
  const loginUser = async (req, res) => {
    const { username, password } = req.body;
  
    // Validate input
    if (!username || !password) {
      console.log("Missing username or password");
      return res.status(400).json({ error: 'Username and password are required' });
    }
  
    try {
      // Find the user by username
      const user = await prisma.user.findUnique({
        where: { username },
      });
  
      // Handle case where user is not found
      if (!user) {
        console.log("User not found:", username);
        return res.status(404).json({ error: 'Invalid username or password' }); // Avoid revealing whether username or password is incorrect
      }
      
      const isPasswordValid = await bcrypt.compare(password, user.password);
  
      if (!isPasswordValid) {
        console.error('Login failed due to invalid password', { username });
        return res.status(401).json({ error: 'Invalid username or password' }); // Avoid revealing which field is wrong
      }
  
      // Generate JWT token
      const token = jwt.sign(
        { id: user.id, username: user.username, admin: user.admin },
        jwtSecret, 
        { expiresIn: '24h' } 
      );
  
      // Sends the token
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
      console.error('Error during login:', error);  // Log any errors that occur during the process
      return res.status(500).json({ error: 'Internal server error' });  // Generic error message
    }
  };
  

const createUser = async (req, res) => {
    const { username, password, admin } = req.body;

    // Validate input
    if (!username || !password) {
        return res.status(400).json({ error: "Username and password are required" });
    }

    try {
        // Hash the password before saving it
        const hashedPassword = await bcrypt.hash(password, 10); // 10 is the salt rounds

        // Create the new user in the database
        const newUser = await prisma.user.create({
            data: {
                username,
                password: hashedPassword, // Store hashed password
                admin: admin || false, // Default to non-admin if not provided
            },
        });

        // Respond with the newly created user (excluding the password)
        res.status(201).json({
            id: newUser.id,
            username: newUser.username,
            admin: newUser.admin,
        });
    } catch (error) {
        console.error("Error creating user:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};


const getUserById = async (req, res) => {
    const { userId } = req.params;

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

const updateUserById = async (req, res) => {
    const { userId } = req.params;
    const { username, password, admin } = req.body;

    try {
        // Check if the user exists
        const user = await prisma.user.findUnique({
            where: { id: parseInt(userId) },
        });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // If trying to update admin status, ensure current user is admin
        if (admin !== undefined && !req.user.admin) {
            return res.status(403).json({ error: "You are not allowed to update admin status" });
        }

        const updatedUser = await prisma.user.update({
            where: { id: parseInt(userId) },
            data: {
                username: username || user.username,
                password: password || user.password, // In real use, hash the password
                admin: admin !== undefined ? admin : user.admin,
            },
        });

        res.status(200).json(updatedUser);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getUserFlashcardSets = async (req, res) => {
    const { userId } = req.params;

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

const getUserCollections = async (req, res) => {
    const { userId } = req.params;

    try {
        const user = await prisma.user.findUnique({
            where: { id: parseInt(userId) },
        });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const collections = await prisma.collection.findMany({
            where: { userId: parseInt(userId) },
            include: {
                flashcardSets: true, // Fetch related flashcard sets
            },
        });

        res.status(200).json(collections); // Return collections with sets
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};


const getCollectionById = async (req, res) => {
    const { userId, collectionId } = req.params;

    try {
        const collection = await prisma.collection.findUnique({
            where: { id: parseInt(collectionId) },
            include: {
                set: true,
                user: true,
            },
        });

        if (!collection || collection.userId !== parseInt(userId)) {
            return res.status(404).json({ error: "Collection not found" });
        }

        res.status(200).json(collection);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const createCollection = async (req, res) => {
    const { userId } = req.params;
    const { comment, setIds } = req.body;

    if (!comment || !Array.isArray(setIds) || setIds.length === 0) {
        return res.status(400).json({ error: 'Comment and at least one setId are required' });
    }

    try {
        const user = await prisma.user.findUnique({
            where: { id: parseInt(userId) },
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Validate that all flashcard sets exist
        const validSetIds = await prisma.flashcardSet.findMany({
            where: {
                id: { in: setIds.map((id) => parseInt(id)) },
            },
        });

        if (validSetIds.length !== setIds.length) {
            return res.status(400).json({ error: 'One or more flashcard sets are invalid' });
        }

        // Create the collection and link sets
        const collection = await prisma.collection.create({
            data: {
                comment,
                userId: parseInt(userId),
                flashcardSets: {
                    connect: validSetIds.map((set) => ({ id: set.id })),
                },
            },
        });

        res.status(201).json(collection);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


const updateCollectionById = async (req, res) => {
    const { userId, collectionId } = req.params;
    const { comment, setIds } = req.body; // Expect setIds as an array of flashcard set IDs

    try {
        // Log the received params for debugging
        console.log('Received collectionId:', collectionId);
        console.log('Received userId:', userId);
        console.log('Received comment:', comment);
        console.log('Received setIds:', setIds);

        // Fetch the collection and check if it exists
        const collection = await prisma.collection.findUnique({
            where: { id: parseInt(collectionId) },
            include: { flashcardSets: true },
        });

        if (!collection || collection.userId !== parseInt(userId)) {
            return res.status(404).json({ error: "Collection not found or user not authorized" });
        }

        // Check if all setIds exist in the flashcardSets table
        const sets = await prisma.flashcardSet.findMany({
            where: {
                id: {
                    in: setIds.map((id) => parseInt(id)), // Convert each ID to an integer
                },
            },
        });

        if (sets.length !== setIds.length) {
            return res.status(400).json({ error: 'Some flashcard sets do not exist' });
        }

        // Update the collection's comment and associated flashcard sets
        const updatedCollection = await prisma.collection.update({
            where: { id: parseInt(collectionId) },
            data: {
                comment,
                flashcardSets: {
                    connect: setIds.map((id) => ({ id: parseInt(id) })), // Convert each ID to an integer
                },
            },
            include: { flashcardSets: true },
        });

        res.status(200).json(updatedCollection); // Return the updated collection
    } catch (error) {
        console.error('Error updating collection:', error.message); // Log the error
        res.status(500).json({ error: error.message });
    }
};

  

const deleteCollectionById = async (req, res) => {
    let { userId, collectionId } = req.params;
    if(!req.user.admin) userID = req.user.id
    try {
        const collection = await prisma.collection.findUnique({
            where: { id: parseInt(collectionId) },
            include: { user: true}
        });

        if (!collection || collection.userId !== parseInt(userId)) {
            return res.status(404).json({ error: "Collection not found" });
        }

        if(collection.user.id != parseInt(userID) ) {
            return res.status(400).json({error: "Bad Request"})
        }

        await prisma.collection.delete({
            where: { 
                id: parseInt(collectionId)
            },
        });
        res.status(204).send();
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
    createCollection,
    getUserCollections,
    getCollectionById,
    updateCollectionById,
    deleteCollectionById,
};
