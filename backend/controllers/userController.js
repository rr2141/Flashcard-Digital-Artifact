const prisma = require('../prisma');

// dificulty of the flashcard 
const difficulty = ['EASY', 'MEDIUM', 'HARD'];

const getAllUsers = async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                username: true,
                admin: true,
            },
        });
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const createUser = async (req, res) => {
    const { username, password, admin } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: "Username and password are required" });
    }

    try {
        const newUser = await prisma.user.create({
            data: {
                username,
                password, // Hash the password in a real implementation
                admin: admin || false, // Default to non-admin
            },
        });
        res.status(201).json(newUser);
    } catch (error) {
        res.status(500).json({ error: error.message });
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

const deleteUserById = async (req, res) => {
    const { userId } = req.params;

    try {
        const user = await prisma.user.findUnique({
            where: { id: parseInt(userId) },
        });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        await prisma.user.delete({
            where: { id: parseInt(userId) },
        });

        res.status(204).send(); // No content response
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
                set: true,
            },
        });

        res.status(200).json(collections);
    } catch (error) {
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

const updateCollectionById = async (req, res) => {
    const { userId, collectionId } = req.params;
    const { comment } = req.body;

    try {
        const collection = await prisma.collection.findUnique({
            where: { id: parseInt(collectionId) },
        });

        if (!collection || collection.userId !== parseInt(userId)) {
            return res.status(404).json({ error: "Collection not found" });
        }

        const updatedCollection = await prisma.collection.update({
            where: { id: parseInt(collectionId) },
            data: { comment },
        });

        res.status(200).json(updatedCollection);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const deleteCollectionById = async (req, res) => {
    const { userId, collectionId } = req.params;

    try {
        const collection = await prisma.collection.findUnique({
            where: { id: parseInt(collectionId) },
        });

        if (!collection || collection.userId !== parseInt(userId)) {
            return res.status(404).json({ error: "Collection not found" });
        }

        await prisma.collection.delete({
            where: { id: parseInt(collectionId) },
        });

        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getAllUsers,
    createUser,
    getUserById,
    updateUserById,
    deleteUserById,
    getUserFlashcardSets,
    getUserCollections,
    getCollectionById,
    updateCollectionById,
    deleteCollectionById,
};
