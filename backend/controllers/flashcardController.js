const prisma = require('../prisma');

// dificulty of the flashcard 
const difficulty = ['EASY', 'MEDIUM', 'HARD'];

// Fetches all flashcards
const getAllFlashcards = async (req, res) => {
    try {
        const flashcards = await prisma.flashcard.findMany({
            include: {
                cards: true,
                comments: true,
            },
        });
        
        res.status(200).json(flashcards);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

//Get a flashcard set by ID
const getFlashcardSetbyID = async (req,res) => {
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
        if (!flashcardSet) {
            return res.status(404).json({
                message: `Flashcard set with ID ${setID} was not found`,  // Fixed here
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

// Update a flashcard set by ID
const updateFlashcardSet = async (req, res) => {
    const { id } = req.params; // Extract the ID from the route parameters
    const { name, cards } = req.body; // Extract data from the request body

    try {
        // Check if the flashcard set exists
        const existingSet = await prisma.flashcardSet.findUnique({
            where: { id: parseInt(id) },
        });

        if (!existingSet) {
            return res.status(404).json({ error: "The flashcard set was not found" });
        }

        // Update the flashcard set
        const updatedSet = await prisma.flashcardSet.update({
            where: { id: parseInt(id) },
            data: {
                name,
                cards: {
                    deleteMany: {}, // Remove existing cards (optional, if cards are being replaced)
                    create: cards.map((card) => ({
                        question: card.question,
                        answer: card.answer,
                        difficulty: card.difficulty,
                    })),
                },
            },
            include: {
                cards: true, // Include updated cards in the response
            },
        });

        res.status(200).json(updatedSet); // Return the updated flashcard set
    } catch (error) {
        res.status(500).json({ error: error.message }); // Handle errors
    }
};

// Create a new flashcard
const createFlashcard = async (req, res) => {
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

//Create Flashcard Set
const createFlashcardSet = async (req, res) => {
    const { name, cards} = req.body;
    const userId = req.user.id;
    try {
        // Setting the bounds for a day
        const start = new Date();
        start.setHours(0,0,0,0); 
        const end = new Date();
        end.setHours(23,59,59,999);

        // Counting how many set user has created today
        //Limit is currently 20
        const setsCreatedToday = await prisma.flashcardSet.count({
            where: {
                userID: userId,
                createdAt: {
                    gte: start,
                    lt: end,
                },
            },
        });

        //If limit of 20 reached, return error message as response
        if (setsCreatedToday >= 20){
            return res.status(429).json({
                error: "You have reached the maximum number of flashcard sets allowed today. Please try again tomorrow"
            })
        }

        const flashcard = await prisma.flashcardSet.create({
            data: {
                name, 
                userId, 
                cards:{
                    create: cards.map((card) => ({
                        question: card.question,
                        answer: card.answer,
                        difficulty: card.difficulty,
                    })),
                },
             },
             include: {
                cards: true,
             }
        });

        res.status(201).json(flashcardSet);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};


// Delete a flashcard set by ID
const deleteFlashcard = async (req, res) => {
    const { id } = req.params; // Extract the ID from the route parameters

    try {
        // Check if the flashcard set exists
        const existingSet = await prisma.flashcardSet.findUnique({
            where: { id: parseInt(id) },
        });

        if (!existingSet) {
            return res.status(404).json({ error: "The flashcard set was not found" });
        }

        // Delete the flashcard set
        await prisma.flashcardSet.delete({
            where: { id: parseInt(id) },
        });

        res.status(204).send(); // No content response
    } catch (error) {
        res.status(500).json({ error: error.message }); // Handle errors
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

// Add a comment to a flashcard set
const addCommentToSet = async (req, res) => {
    const { setID } = req.params;
    const { comment } = req.body;
    const userId = req.user.id; // Assuming authentication middleware sets `req.user`

    try {
        // Check if the flashcard set exists
        const flashcardSet = await prisma.flashcardSet.findUnique({
            where: { id: parseInt(setID) },
        });

        if (!flashcardSet) {
            return res.status(404).json({ error: "The flashcard set was not found" });
        }

        // Add the comment to the flashcard set
        const newComment = await prisma.comment.create({
            data: {
                comment,
                setId: parseInt(setID),
                userId, // Associate the comment with the logged-in user
            },
        });

        res.status(201).json(newComment); // Return the created comment
    } catch (error) {
        res.status(500).json({ error: error.message }); // Handle errors
    }
};

// Get all flashcards in a specific set
const getFlashcardsInSet = async (req, res) => {
    const { setId } = req.params;
    const { shuffle } = req.query;

    try {
        // Check if the flashcard set exists
        const flashcardSet = await prisma.flashcardSet.findUnique({
            where: { id: parseInt(setId) },
            include: { cards: true },
        });

        if (!flashcardSet) {
            return res.status(404).json({ error: "The flashcard set was not found" });
        }

        let flashcards = flashcardSet.cards;

        // Shuffle flashcards if the query parameter `shuffle` is true
        if (shuffle === "true") {
            flashcards = flashcards.sort(() => Math.random() - 0.5);
        }

        res.status(200).json(flashcards); // Return the list of flashcards
    } catch (error) {
        res.status(500).json({ error: error.message }); // Handle errors
    }
};

module.exports = {
  getAllFlashcards,
  getFlashcardSetbyID,
  updateFlashcard,
  updateFlashcardSet,
  createFlashcard,
  createFlashcardSet,
  deleteFlashcard,
  addCommentToSet,
  getFlashcardsInSet,
};
