const prisma = require('../prisma');


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

// Get all flashcard sets
const getAllFlashcardSets = async (req, res) => {
    try {
        // Fetch all flashcard sets using Prisma
        const flashcardSets = await prisma.flashcardSet.findMany({
            include: {
                cards: true, // Optionally include associated cards
                comments: {
                    include: {
                        author: true // Include author details for comments if needed
                    }
                }
            }
        });

        // Check if any flashcard sets exist
        if (!flashcardSets || flashcardSets.length === 0) {
            console.log("No flashcard sets found."); // Log if none exist
            return res.status(404).json({ error: 'No flashcard sets found.' });
        }

        // Return all flashcard sets
        res.json(flashcardSets);

    } catch (error) {
        console.error('Error fetching flashcard sets:', error); // Log the full error for debugging
        res.status(500).json({ error: error.message });
    }
};

//Get a flashcard set by ID
const getFlashcardSetbyID = async (req, res) => {
    const { setID } = req.params; // Get the setID from the URL params
    console.log("setID:", setID);  // Log the setID to check if it's being passed correctly

    try {
        // Ensure setID is a number (or convert it to a number if it's a string)
        const parsedSetID = parseInt(setID, 10);
        if (isNaN(parsedSetID)) {
            console.error("Invalid setID, not a number:", setID);  // Log if setID is not a valid number
            return res.status(400).json({ error: 'Invalid setID provided.' });
        }

        // Attempt to find the flashcard set using Prisma
        const flashcardSet = await prisma.flashcardSet.findUnique({
            where: {
                id: parsedSetID,  // Use the parsed integer setID
            },
            include: {
                cards: true,  // Include cards if necessary
                comments: {
                    include: {
                        author: true  // Include author details in the comments if needed
                    }
                }
            }
        });

        // Check if the flashcard set exists
        if (!flashcardSet) {
            console.log("Flashcard set not found for ID:", setID);  // Log if not found
            return res.status(404).json({ error: 'Flashcard set not found' });
        }

        // Return the found flashcard set
        res.json(flashcardSet);

    } catch (error) {
        console.error('Error fetching flashcard set:', error);  // Log the full error object for more details
        res.status(500).json({ error: error.message });
    }
};

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

// Create a flashcard
const createFlashcard = async (req, res) => {
    const { setId, question, answer, difficulty } = req.body;

    try {
        // Validate the input
        if (!setId || !question || !answer || !difficulty) {
            return res.status(400).json({ error: "All fields are required" });
        }

        // Convert setId to an integer
        const parsedSetId = parseInt(setId, 10);
        if (isNaN(parsedSetId)) {
            return res.status(400).json({ error: "Invalid setId provided" });
        }

        // Ensure the flashcard set exists
        const flashcardSet = await prisma.flashcardSet.findUnique({
            where: { id: parsedSetId },
        });

        if (!flashcardSet) {
            return res.status(404).json({ error: "Flashcard set not found" });
        }

        // Create the flashcard
        const flashcard = await prisma.flashcard.create({
            data: {
                setId: parsedSetId, // Pass the numeric ID
                question,
                answer,
                difficulty,
            },
        });

        // Respond with the created flashcard
        res.status(201).json(flashcard);
    } catch (error) {
        console.error("Error creating flashcard:", error.message);
        res.status(500).json({ error: error.message });
    }
};

const createFlashcardSet = async (req, res) => {
    const { name } = req.body;  // Get the name of the flashcard set
    const userId = req.user.id;  // Get the user ID from the authenticated request
  
    try {
      // Get today's date range (start and end of the day)
      const start = new Date();
      start.setHours(0, 0, 0, 0);  // Set the start of the day to midnight
      const end = new Date();
      end.setHours(23, 59, 59, 999);  // Set the end of the day to just before midnight
  
      // Count the number of flashcard sets the user has created today
      const setsCreatedToday = await prisma.flashcardSet.count({
        where: {
          userId: userId,  // Ensure it matches the user's ID
          createdAt: {
            gte: start,  // Greater than or equal to start of the day
            lt: end,     // Less than the end of the day
          },
        },
      });
  
      // Check if the user has exceeded the daily limit (20 sets per day)
      if (setsCreatedToday >= 20) {
        return res.status(429).json({
          error: "You have reached the maximum number of flashcard sets allowed today. Please try again tomorrow.",
        });
      }
  
      // Create the new flashcard set
      const flashcardSet = await prisma.flashcardSet.create({
        data: {
          name,      // Set the name of the flashcard set
          userId,    // Associate the set with the logged-in user
        },
      });
  
      // Return the created flashcard set
      res.status(201).json(flashcardSet);
    } catch (error) {
      console.error("Error creating flashcard set:", error.message);
      res.status(500).json({ error: error.message });
    }
  };
  
  const deleteFlashcard = async (req, res) => {
    const { id } = req.params; // Extract the ID from the route parameters

    try {
        // Check if the flashcard exists
        const existingFlashcard = await prisma.flashcard.findUnique({
            where: { id: parseInt(id) },
        });

        if (!existingFlashcard) {
            return res.status(404).json({ error: "Flashcard not found" });
        }

        // Delete the flashcard
        await prisma.flashcard.delete({
            where: { id: parseInt(id) },
        });

        res.status(204).send(); // No content response
    } catch (error) {
        console.error('Error deleting flashcard:', error);
        res.status(500).json({ error: error.message }); // Handle errors
    }
};
// Delete a flashcard set by ID
const deleteFlashcardSet= async (req, res) => {
    const { id } = req.params; // Extract the ID from the route parameters

    try {
        // Check if the flashcard set exists
        const existingSet = await prisma.flashcardSet.findUnique({
            where: { id: parseInt(id) },
        });

        if (!existingSet) {
            return res.status(404).json({ error: "The flashcard set was not found" });
        }
        
        // Delete associated flashcards (delete all flashcards that belong to this set)
        await prisma.flashcard.deleteMany({
            where: { setId: parseInt(id) },  
        });
        

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
    const { setID } = req.params;   // Set ID from the URL parameter
    const { comment } = req.body;   // Comment content from the request body
    const userId = req.user.id;     // User ID from the authentication middleware
  
    try {
      // Check if the FlashcardSet exists
      const flashcardSet = await prisma.flashcardSet.findUnique({
        where: { id: parseInt(setID) },  // Find the set by ID
      });
  
      if (!flashcardSet) {
        return res.status(404).json({ error: 'Flashcard set not found' });
      }
  
      // Create the comment and associate it with both the FlashcardSet and User
      const newComment = await prisma.comment.create({
        data: {
          comment,          // The comment text
          set: {            // Connect the comment to the FlashcardSet
            connect: { id: parseInt(setID) },
          },
          author: {         // Connect the comment to the User
            connect: { id: userId },
          },
        },
      });
  
      res.status(201).json(newComment);  // Return the newly created comment
    } catch (error) {
      console.error('Error adding comment:', error);
      res.status(500).json({ error: error.message });
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

const getRecentComment = async (req, res) => {
    const { setID } = req.params;
  
    try {
      const recentComment = await prisma.comment.findFirst({
        where: { setId: parseInt(setID) },
        orderBy: { createdAt: 'desc' },
      });
  
      if (!recentComment) {
        return res.status(404).json({ message: 'No comments found for this set' });
      }
  
      res.json(recentComment);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error fetching recent comment' });
    }
  };
  

module.exports = {
  getAllFlashcards,
  getAllFlashcardSets,
  getFlashcardSetbyID,
  updateFlashcard,
  updateFlashcardSet,
  createFlashcard,
  createFlashcardSet,
  deleteFlashcard,
  deleteFlashcardSet,
  addCommentToSet,
  getRecentComment,
  getFlashcardsInSet,
};
