const prisma = require('../prisma');

// Get all flashcard sets
const getAllFlashcardSets = async (req, res) => {
    try {
     
      const flashcardSets = await prisma.flashcardSet.findMany({
        include: {
          cards: true,      
          comments: true,   
        },
      });
      res.status(200).json(flashcardSets);
    } catch (error) {
      console.error('Error fetching flashcard sets:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Get a flashcard set by ID
const getFlashcardSetbyID = async (req, res) => {
    const { setId } = req.params; 
    console.log("setID:", setId);  

    try {
       
        const parsedSetID = parseInt(setId, 10);
        if (isNaN(parsedSetID)) {
            console.error("Invalid setID, not a number:", setId);  
            return res.status(400).json({ error: 'Invalid setID provided.' });
        }


        const flashcardSet = await prisma.flashcardSet.findUnique({
            where: {
                id: parsedSetID, 
            },
            include: {
                cards: true,  
                comments: true 
            }
        });

        if (!flashcardSet) {
            return res.status(404).json({ error: 'Flashcard set not found' });
        }

        res.status(200).json(flashcardSet);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Create a flashcard set
const createFlashcardSet = async (req, res) => {
  const { name } = req.body;
  const userId = req.user.id; 

  if (!name) {
    return res.status(400).json({ error: 'Name is required' });
  }

  try {
    const settings = await prisma.settings.findFirst(); 

    const limit = settings ? settings.dailyLimit : 20; 
  

    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);

    const setsCreatedToday = await prisma.flashcardSet.count({
      where: {
        userId: userId,
        createdAt: {
          gte: start,
          lt: end,
        },
      },
    });

    if (setsCreatedToday >= limit) {
      return res.status(429).json({
        error:
          'You have reached the maximum number of flashcard sets allowed today. Please try again tomorrow.',
      });
    }

    const flashcardSet = await prisma.flashcardSet.create({
      data: {
        name,
        userId,
      },
    });

    res.status(201).json(flashcardSet);
  } catch (error) {
    console.error('Error creating flashcard set:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update a flashcard set by ID
const updateFlashcardSet = async (req, res) => {
    const { id } = req.params; 
    const { name, cards } = req.body; 

    if (!name) {
        return res.status(400).json({ error: 'Name is required' });
    }
    try {
        const existingSet = await prisma.flashcardSet.findUnique({
            where: { id: parseInt(id) },
        });

        if (!existingSet) {
            return res.status(404).json({ error: "The flashcard set was not found" });
        }

        const updatedSet = await prisma.flashcardSet.update({
            where: { id: parseInt(id) },
            data: {
                name,
                cards: {
                    deleteMany: {}, 
                    create: cards.map((card) => ({
                        question: card.question,
                        answer: card.answer,
                        difficulty: card.difficulty,
                    })),
                },
            },
            include: {
                cards: true, 
            },
        });

        res.status(200).json(updatedSet); 
    } catch (error) {
        res.status(500).json({ error: error.message }); 
    }
};


// Delete a flashcard set by ID
const deleteFlashcardSet = async (req, res) => {
  const { setId } = req.params;
  try {
      const parsedId = parseInt(setId, 10);

      if (isNaN(parsedId)) {
          console.error(`Invalid flashcard set ID format: ${setId}`);
          return res.status(400).json({ error: 'Invalid flashcard set ID format.' });
      }

      const existingSet = await prisma.flashcardSet.findUnique({
          where: { id: parsedId },
      });

      if (!existingSet) {
          console.error(`Flashcard set not found with ID: ${parsedId}`);
          return res.status(404).json({ error: 'The flashcard set was not found.' });
      }

      await prisma.flashcardSet.delete({
          where: { id: parsedId },
      });

      res.status(204).send();
  } catch (error) {
      console.error(`Error deleting flashcard set with ID ${parsedId}:`, error);
      res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Add a comment to a specific flashcard set
const addCommentToSet = async (req, res) => {
    const { setId } = req.params;
    const { comment,rating } = req.body;
    const userId = req.user.id;

    if (!comment) {
      return res.status(400).json({ error: 'Comment cannot be empty' });
    }

    if (typeof rating !== 'number' || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be a number between 1 and 5.' });
    }
  
    try {
      const newComment = await prisma.comment.create({
        data: {
          comment,
          rating,
          set: {
            connect: { id: parseInt(setId) },
          },
          user: {
            connect: { id: userId },
          },
        },
        include: { user: true },
      });
      res.status(201).json(newComment);
    } catch (error) {
      console.error('Error adding comment:', error.message);
      res.status(500).json({ error: 'Error adding comment to set' });
    }
  };
  
// Fetch all comments for a specific flashcard set
const getCommentsForSet = async (req, res) => {
    const { setId } = req.params;
    try {
      const parsedSetId = parseInt(setId, 10);

      if (isNaN(parsedSetId)) {
        return res.status(400).json({ error: 'Invalid setId provided.' });
      }

      const flashcardSet = await prisma.flashcardSet.findUnique({
        where: { id: parsedSetId },
      });

      if (!flashcardSet) {
        return res.status(404).json({ error: 'Flashcard set not found.' });
      }

      const comments = await prisma.comment.findMany({
        where: { setId: parsedSetId }, 
        include: { user: true },
        orderBy: { createdAt: 'desc' },
      });

      if (comments.length === 0) {
        return res.status(404).json({ error: 'No comments found for this set' });
      }

      res.status(200).json(comments);
    } catch (error) {
      console.error('Error fetching comments:', error.message);
      res.status(500).json({ error: 'Error fetching comments' });
    }
};


module.exports = {
    getAllFlashcardSets,
    getFlashcardSetbyID,
    createFlashcardSet,
    updateFlashcardSet,
    deleteFlashcardSet,
    addCommentToSet,
    getCommentsForSet,
};