const prisma = require('../prisma');

// Fetches all flashcards
const getAllFlashcards = async (req, res) => {
    try {
        const flashcards = await prisma.flashcard.findMany();
        res.status(200).json(flashcards);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Create a flashcard
const createFlashcard = async (req, res) => {
    const { setId, question, answer, difficulty } = req.body;

    try {
   
        if (!setId || !question || !answer || !difficulty) {
            return res.status(400).json({ error: "All fields are required" });
        }

        const parsedSetId = parseInt(setId, 10);
        if (isNaN(parsedSetId)) {
            return res.status(400).json({ error: "Invalid setId provided" });
        }

        const flashcardSet = await prisma.flashcardSet.findUnique({
            where: { id: parsedSetId },
        });

        if (!flashcardSet) {
            return res.status(404).json({ error: "Flashcard set not found" });
        }


        const flashcard = await prisma.flashcard.create({
            data: {
                setId: parsedSetId, 
                question,
                answer,
                difficulty,
            },
        });

        res.status(201).json(flashcard);
    } catch (error) {
        console.error("Error creating flashcard:", error.message);
        res.status(500).json({ error: error.message });
    }
};

// Update a flashcard by ID
const updateFlashcard = async (req, res) => {
    const { id } = req.params;
    const { question, answer } = req.body;
    try {
        const flashcard = await prisma.flashcard.update({
            where: { id: parseInt(id) },
            data: { question, answer },
        });
        res.status(200).json(flashcard);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Delete a flashcard by ID
const deleteFlashcard = async (req, res) => {
    const { id } = req.params;

    try {
        const existingFlashcard = await prisma.flashcard.findUnique({
            where: { id: parseInt(id) },
        });

        if (!existingFlashcard) {
            return res.status(404).json({ error: "Flashcard not found" });
        }

        await prisma.flashcard.delete({
            where: { id: parseInt(id) },
        });

        res.status(204).send();
    } catch (error) {
        console.error('Error deleting flashcard:', error);
        res.status(500).json({ error: error.message });
    }
};

// Get all flashcards in a specific set
const getFlashcardsInSet = async (req, res) => {
    const { setId } = req.params;
    const { shuffle } = req.query;

    try {
     
        const flashcardSet = await prisma.flashcardSet.findUnique({
            where: { id: parseInt(setId) },
            include: { cards: true },
        });

        if (!flashcardSet) {
            return res.status(404).json({ error: "The flashcard set was not found" });
        }

        let flashcards = flashcardSet.cards;

        if (flashcards.length === 0) {
            return res.status(200).json({ message: "No flashcards found. Please create a new flashcard." });
        }

       
        if (shuffle === "true") {
            flashcards = flashcards.sort(() => Math.random() - 0.5);
        }

        res.status(200).json(flashcards); 
    } catch (error) {
        res.status(500).json({ error: error.message }); 
    }
};

module.exports = {
    getAllFlashcards,
    createFlashcard,
    updateFlashcard,
    deleteFlashcard,
    getFlashcardsInSet,
};