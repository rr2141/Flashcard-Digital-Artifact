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
  const { setID } = req.params;
  console.log("setID:", setID);

  try {
    const parsedSetID = parseInt(setID, 10);
    if (isNaN(parsedSetID)) {
      console.error("Invalid setID, not a number:", setID);
      return res.status(400).json({ error: 'Invalid setID provided.' });
    }

    const flashcardSet = await prisma.flashcardSet.findUnique({
      where: {
        id: parsedSetID,
      },
      include: {
        cards: true,
        comments: true,
      },
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

    if (setsCreatedToday >= 20) {
      return res.status(429).json({
        error: "You have reached the maximum number of flashcard sets allowed today. Please try again tomorrow.",
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
    console.error("Error creating flashcard set:", error.message);
    res.status(500).json({ error: error.message });
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
  const { id } = req.params;

  try {
    const existingSet = await prisma.flashcardSet.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingSet) {
      return res.status(404).json({ error: "The flashcard set was not found" });
    }

    await prisma.flashcard.deleteMany({
      where: { setId: parseInt(id) },
    });

    await prisma.flashcardSet.delete({
      where: { id: parseInt(id) },
    });

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Add a comment to a specific flashcard set
const addCommentToSet = async (req, res) => {
  const { setId } = req.params;
  const { comment } = req.body;
  const userId = req.user.id;

  if (!comment) {
    return res.status(400).json({ error: 'Comment cannot be empty' });
  }

  try {
    const newComment = await prisma.comment.create({
      data: {
        comment,
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
    const comments = await prisma.comment.findMany({
      where: { setId: parseInt(setId) },
      include: { user: true },
    });
    if (comments.length === 0) {
      return res.status(404).json({ error: 'No comments found for this set' });
    }
    res.status(200).json(comments);
  } catch (error) {
    console.error('Error fetching comments:', error.message);
    res.status(500).json({ error: 'Error fetching comments for set' });
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