const prisma = require('../prisma');

// gets all collections for a user
const getUserCollections = async (req, res) => {
    const userId = req.user.id; 

    try {
        const collections = await prisma.collection.findMany({
            where: { userId: parseInt(userId) },
            include: {
                flashcardSets: true, 
            },
        });

        res.status(200).json(collections); 
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

// gets a collection by id
const getCollectionById = async (req, res) => {
    const { collectionId } = req.params;
    const userId = req.user.id; 

    try {
        const collection = await prisma.collection.findUnique({
            where: { id: parseInt(collectionId) },
            include: {
                flashcardSets: true,
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

// creates a collection
const createCollection = async (req, res) => {
    const userId = req.user.id; 
    const { comment, setIds } = req.body;

    if (!comment || !Array.isArray(setIds) || setIds.length === 0) {
        return res.status(400).json({ error: 'Comment and at least one setId are required' });
    }

    try {
        const validSetIds = await prisma.flashcardSet.findMany({
            where: {
                id: { in: setIds.map((id) => parseInt(id)) },
            },
        });

        if (validSetIds.length !== setIds.length) {
            return res.status(400).json({ error: 'One or more flashcard sets are invalid' });
        }

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

// updates a collection by id
const updateCollectionById = async (req, res) => {
    const { collectionId } = req.params;
    const userId = req.user.id; 
    const { comment, setIds } = req.body; 

    try {
        const collection = await prisma.collection.findUnique({
            where: { id: parseInt(collectionId) },
            include: { flashcardSets: true },
        });

        if (!collection || collection.userId !== parseInt(userId)) {
            return res.status(404).json({ error: "Collection not found or user not authorized" });
        }

        const sets = await prisma.flashcardSet.findMany({
            where: {
                id: {
                    in: setIds.map((id) => parseInt(id)), 
                },
            },
        });

        if (sets.length !== setIds.length) {
            return res.status(400).json({ error: 'Some flashcard sets do not exist' });
        }

        const updatedCollection = await prisma.collection.update({
            where: { id: parseInt(collectionId) },
            data: {
                comment,
                flashcardSets: {
                    connect: setIds.map((id) => ({ id: parseInt(id) })), 
                },
            },
            include: { flashcardSets: true },
        });

        res.status(200).json(updatedCollection); 
    } catch (error) {
        console.error('Error updating collection:', error.message); 
        res.status(500).json({ error: error.message });
    }
};

// deletes a collection by id
const deleteCollectionById = async (req, res) => {
    const { collectionId } = req.params;
    const userId = req.user.id; 

    try {
        const collection = await prisma.collection.findUnique({
            where: { id: parseInt(collectionId) },
            include: { user: true }
        });

        if (!collection || collection.userId !== parseInt(userId)) {
            return res.status(404).json({ error: "Collection not found" });
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
    getUserCollections,
    getCollectionById,
    createCollection,
    updateCollectionById,
    deleteCollectionById,
};