const prisma = require('../db');

// dificulty of the flashcard 
const difficulty = ['EASY', 'MEDIUM', 'HARD'];

// Fetch all flashcards
exports.getAllFlashcards = async (req, res) => {
    try {
        const flashcards = await prisma.flashcard.findMany();
        res.status(200).json(flashcards);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

//Get a flashcard set by ID
exports.getFlashcardSetbyID = async (req,res) => {
    const {setID} = req.params;

    try{
        const flashcardSet = await prisma.flashcardSet.findUnique({
            where: { id: parseInt(setID)},
            include: {
                cards: true,
                comments: {
                    include: {
                        author: true,
                    },
                },
            },
        });

        // If flashcard set not found using the ID provided, error message shown to user
        if (!flashcardSet)
        {
            return res.status(404).json({
                message: 'Flashcard set with ID ${setID} was not found',
            });
        }

        // If ID relates to set, return the flashcard set
        res.status(200).json(flashcardSet);
    }
    catch (error){
        //handles errors 
        //returns 500 response with error message
        res.status(500).json({error: error.message})
    }
}

// Create a new flashcard
exports.createFlashcard = async (req, res) => {
    const { question, answer } = req.body;
    try {
        const flashcard = await prisma.flashcard.create({
            data: { question, answer },
        });
        res.status(201).json(flashcard);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Delete a flashcard by ID
exports.deleteFlashcard = async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.flashcard.delete({
            where: { id: parseInt(id) },
        });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update a flashcard by ID
exports.updateFlashcard = async (req, res) => {
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

