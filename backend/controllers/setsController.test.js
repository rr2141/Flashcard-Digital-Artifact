const prisma = require('../prisma');
const setController = require('../controllers/setController');

// Mock the Prisma client
jest.mock('../prisma', () => ({
  flashcardSet: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  settings: {
    findFirst: jest.fn(),
  },
  comment: {
    create: jest.fn(),
    findMany: jest.fn(),
  },
}));

describe('Set Controller', () => {
  let req, res;

  beforeEach(() => {
    req = {
      user: { id: 1 },
      params: {},
      body: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      send: jest.fn(),
    };
  });

  describe('getAllFlashcardSets', () => {
    it('should return all flashcard sets', async () => {
      const flashcardSets = [{ id: 1, name: 'Test Set' }];
      prisma.flashcardSet.findMany.mockResolvedValue(flashcardSets);

      await setController.getAllFlashcardSets(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(flashcardSets);
    });

    it('should handle errors', async () => {
      const error = new Error('Database error');
      prisma.flashcardSet.findMany.mockRejectedValue(error);

      await setController.getAllFlashcardSets(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Internal Server Error' });
    });
  });

  describe('getFlashcardSetbyID', () => {
    it('should return a flashcard set by ID', async () => {
      const flashcardSet = { id: 1, name: 'Test Set' };
      req.params.setId = 1;
      prisma.flashcardSet.findUnique.mockResolvedValue(flashcardSet);

      await setController.getFlashcardSetbyID(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(flashcardSet);
    });

    it('should return 404 if flashcard set not found', async () => {
      req.params.setId = 1;
      prisma.flashcardSet.findUnique.mockResolvedValue(null);

      await setController.getFlashcardSetbyID(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Flashcard set not found' });
    });

    it('should handle errors', async () => {
      const error = new Error('Database error');
      req.params.setId = 1;
      prisma.flashcardSet.findUnique.mockRejectedValue(error);

      await setController.getFlashcardSetbyID(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: error.message });
    });
  });

  describe('createFlashcardSet', () => {
    it('should create a new flashcard set', async () => {
      const flashcardSet = { id: 1, name: 'Test Set' };
      req.body = { name: 'Test Set' };
      prisma.settings.findFirst.mockResolvedValue({ dailyLimit: 20 });
      prisma.flashcardSet.count.mockResolvedValue(0);
      prisma.flashcardSet.create.mockResolvedValue(flashcardSet);

      await setController.createFlashcardSet(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(flashcardSet);
    });

    it('should return 400 if name is missing', async () => {
      req.body = { name: '' };

      await setController.createFlashcardSet(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Name is required' });
    });

    it('should return 429 if daily limit is reached', async () => {
      req.body = { name: 'Test Set' };
      prisma.settings.findFirst.mockResolvedValue({ dailyLimit: 1 });
      prisma.flashcardSet.count.mockResolvedValue(1);

      await setController.createFlashcardSet(req, res);

      expect(res.status).toHaveBeenCalledWith(429);
      expect(res.json).toHaveBeenCalledWith({
        error: 'You have reached the maximum number of flashcard sets allowed today. Please try again tomorrow.',
      });
    });

    it('should handle errors', async () => {
      const error = new Error('Database error');
      req.body = { name: 'Test Set' };
      prisma.settings.findFirst.mockRejectedValue(error);

      await setController.createFlashcardSet(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' });
    });
  });

  describe('updateFlashcardSet', () => {
    it('should update a flashcard set by ID', async () => {
      const flashcardSet = { id: 1, name: 'Updated Set' };
      req.params.id = 1;
      req.body = { name: 'Updated Set', cards: [] };
      prisma.flashcardSet.findUnique.mockResolvedValue(flashcardSet);
      prisma.flashcardSet.update.mockResolvedValue(flashcardSet);

      await setController.updateFlashcardSet(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(flashcardSet);
    });

    it('should return 404 if flashcard set not found', async () => {
      req.params.id = 1;
      req.body = { name: 'Updated Set', cards: [] };
      prisma.flashcardSet.findUnique.mockResolvedValue(null);

      await setController.updateFlashcardSet(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'The flashcard set was not found' });
    });

    it('should return 400 if name is missing', async () => {
      req.params.id = 1;
      req.body = { name: '', cards: [] };

      await setController.updateFlashcardSet(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Name is required' });
    });

    it('should handle errors', async () => {
      const error = new Error('Database error');
      req.params.id = 1;
      req.body = { name: 'Updated Set', cards: [] };
      prisma.flashcardSet.findUnique.mockRejectedValue(error);

      await setController.updateFlashcardSet(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: error.message });
    });
  });

  describe('deleteFlashcardSet', () => {
    it('should delete a flashcard set by ID', async () => {
      const flashcardSet = { id: 1, name: 'Test Set' };
      req.params.setId = 1;
      prisma.flashcardSet.findUnique.mockResolvedValue(flashcardSet);

      await setController.deleteFlashcardSet(req, res);

      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.send).toHaveBeenCalled();
    });

    it('should return 404 if flashcard set not found', async () => {
      req.params.setId = 1;
      prisma.flashcardSet.findUnique.mockResolvedValue(null);

      await setController.deleteFlashcardSet(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'The flashcard set was not found.' });
    });

    it('should return 400 if setId is invalid', async () => {
      req.params.setId = 'invalid';

      await setController.deleteFlashcardSet(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Invalid flashcard set ID format.' });
    });

    it('should handle errors', async () => {
      const error = new Error('Database error');
      req.params.setId = 1;
      prisma.flashcardSet.findUnique.mockRejectedValue(error);

      await setController.deleteFlashcardSet(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Internal Server Error' });
    });
  });

  describe('addCommentToSet', () => {
    it('should add a comment to a flashcard set', async () => {
      const comment = { id: 1, comment: 'Great set!', rating: 5 };
      req.params.setId = 1;
      req.body = { comment: 'Great set!', rating: 5 };
      prisma.comment.create.mockResolvedValue(comment);

      await setController.addCommentToSet(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(comment);
    });

    it('should return 400 if comment is missing', async () => {
      req.params.setId = 1;
      req.body = { comment: '', rating: 5 };

      await setController.addCommentToSet(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Comment cannot be empty' });
    });

    it('should return 400 if rating is invalid', async () => {
      req.params.setId = 1;
      req.body = { comment: 'Great set!', rating: 6 };

      await setController.addCommentToSet(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Rating must be a number between 1 and 5.' });
    });

    it('should handle errors', async () => {
      const error = new Error('Database error');
      req.params.setId = 1;
      req.body = { comment: 'Great set!', rating: 5 };
      prisma.comment.create.mockRejectedValue(error);

      await setController.addCommentToSet(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Error adding comment to set' });
    });
  });

  describe('getCommentsForSet', () => {
    it('should return all comments for a flashcard set', async () => {
      const comments = [{ id: 1, comment: 'Great set!', rating: 5 }];
      req.params.setId = 1;
      prisma.comment.findMany.mockResolvedValue(comments);

      await setController.getCommentsForSet(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(comments);
    });

    it('should return 404 if no comments found', async () => {
      req.params.setId = 1;
      prisma.comment.findMany.mockResolvedValue([]);

      await setController.getCommentsForSet(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'No comments found for this set' });
    });

    it('should return 400 if setId is invalid', async () => {
      req.params.setId = 'invalid';

      await setController.getCommentsForSet(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Invalid setId provided.' });
    });

    it('should handle errors', async () => {
      const error = new Error('Database error');
      req.params.setId = 1;
      prisma.comment.findMany.mockRejectedValue(error);

      await setController.getCommentsForSet(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Error fetching comments' });
    });
  });
});