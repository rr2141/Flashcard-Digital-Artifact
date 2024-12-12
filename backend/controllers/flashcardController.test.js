const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const { getAllFlashcards, createFlashcard, updateFlashcard, deleteFlashcard, getFlashcardsInSet } = require('../controllers/flashcardController');
const prisma = require('../prisma');
const { authenticate } = require('../middleware/authenticate');

jest.mock('../prisma');
jest.mock('../middleware/authenticate');

const app = express();
app.use(bodyParser.json());
app.use(authenticate);
app.get('/api/flashcards', getAllFlashcards);
app.post('/api/flashcards', createFlashcard);
app.put('/api/flashcards/:id', updateFlashcard);
app.delete('/api/flashcards/:id', deleteFlashcard);
app.get('/api/flashcards/set/:setId', getFlashcardsInSet);

describe('Flashcard Controller', () => {
    const mockUser = { id: 1, username: 'testUser', admin: false };
    const mockFlashcard = { id: 1, question: 'Test Question', answer: 'Test Answer', difficulty: 'EASY', setId: 1 };
    const mockFlashcardSet = { id: 1, name: 'Test Set', cards: [mockFlashcard] };

    beforeEach(() => {
        authenticate.mockImplementation((req, res, next) => {
            req.user = mockUser;
            next();
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('getAllFlashcards', () => {
        it('should return 200 and all flashcards', async () => {
            prisma.flashcard.findMany.mockResolvedValue([mockFlashcard]);

            const response = await request(app).get('/api/flashcards');

            expect(response.status).toBe(200);
            expect(response.body).toEqual([mockFlashcard]);
        });

        it('should return 500 if an error occurs', async () => {
            prisma.flashcard.findMany.mockRejectedValue(new Error('Database error'));

            const response = await request(app).get('/api/flashcards');

            expect(response.status).toBe(500);
            expect(response.body).toEqual({ error: 'Database error' });
        });
    });

    describe('createFlashcard', () => {
        it('should return 201 and the created flashcard for a valid request', async () => {
            prisma.flashcardSet.findUnique.mockResolvedValue(mockFlashcardSet);
            prisma.flashcard.create.mockResolvedValue(mockFlashcard);

            const response = await request(app)
                .post('/api/flashcards')
                .send({ setId: 1, question: 'Test Question', answer: 'Test Answer', difficulty: 'EASY' });

            expect(response.status).toBe(201);
            expect(response.body).toEqual(mockFlashcard);
        });

        it('should return 400 if required fields are missing', async () => {
            const response = await request(app)
                .post('/api/flashcards')
                .send({ question: 'Test Question', answer: 'Test Answer' });

            expect(response.status).toBe(400);
            expect(response.body).toEqual({ error: 'All fields are required' });
        });

        it('should return 404 if flashcard set is not found', async () => {
            prisma.flashcardSet.findUnique.mockResolvedValue(null);

            const response = await request(app)
                .post('/api/flashcards')
                .send({ setId: 1, question: 'Test Question', answer: 'Test Answer', difficulty: 'EASY' });

            expect(response.status).toBe(404);
            expect(response.body).toEqual({ error: 'Flashcard set not found' });
        });

        it('should return 500 if an error occurs', async () => {
            prisma.flashcardSet.findUnique.mockRejectedValue(new Error('Database error'));

            const response = await request(app)
                .post('/api/flashcards')
                .send({ setId: 1, question: 'Test Question', answer: 'Test Answer', difficulty: 'EASY' });

            expect(response.status).toBe(500);
            expect(response.body).toEqual({ error: 'Database error' });
        });
    });

    describe('updateFlashcard', () => {
        it('should return 200 and the updated flashcard for a valid request', async () => {
            prisma.flashcard.update.mockResolvedValue(mockFlashcard);

            const response = await request(app)
                .put('/api/flashcards/1')
                .send({ question: 'Updated Question', answer: 'Updated Answer' });

            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockFlashcard);
        });

        it('should return 500 if an error occurs', async () => {
            prisma.flashcard.update.mockRejectedValue(new Error('Database error'));

            const response = await request(app)
                .put('/api/flashcards/1')
                .send({ question: 'Updated Question', answer: 'Updated Answer' });

            expect(response.status).toBe(500);
            expect(response.body).toEqual({ error: 'Database error' });
        });
    });

    describe('deleteFlashcard', () => {
        it('should return 204 for a successful deletion', async () => {
            prisma.flashcard.findUnique.mockResolvedValue(mockFlashcard);
            prisma.flashcard.delete.mockResolvedValue({});

            const response = await request(app).delete('/api/flashcards/1');

            expect(response.status).toBe(204);
        });

        it('should return 404 if flashcard is not found', async () => {
            prisma.flashcard.findUnique.mockResolvedValue(null);

            const response = await request(app).delete('/api/flashcards/999');

            expect(response.status).toBe(404);
            expect(response.body).toEqual({ error: 'Flashcard not found' });
        });

        it('should return 500 if an error occurs', async () => {
            prisma.flashcard.findUnique.mockResolvedValue(mockFlashcard);
            prisma.flashcard.delete.mockRejectedValue(new Error('Database error'));

            const response = await request(app).delete('/api/flashcards/1');

            expect(response.status).toBe(500);
            expect(response.body).toEqual({ error: 'Database error' });
        });
    });

    describe('getFlashcardsInSet', () => {
        it('should return 200 and the flashcards in the set', async () => {
            prisma.flashcardSet.findUnique.mockResolvedValue(mockFlashcardSet);

            const response = await request(app).get('/api/flashcards/set/1');

            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockFlashcardSet.cards);
        });

        it('should return 404 if flashcard set is not found', async () => {
            prisma.flashcardSet.findUnique.mockResolvedValue(null);

            const response = await request(app).get('/api/flashcards/set/999');

            expect(response.status).toBe(404);
            expect(response.body).toEqual({ error: 'The flashcard set was not found' });
        });

        it('should return 200 and a message if no flashcards are found in the set', async () => {
            prisma.flashcardSet.findUnique.mockResolvedValue({ ...mockFlashcardSet, cards: [] });

            const response = await request(app).get('/api/flashcards/set/1');

            expect(response.status).toBe(200);
            expect(response.body).toEqual({ message: 'No flashcards found. Please create a new flashcard.' });
        });

        it('should return 200 and shuffled flashcards if shuffle is true', async () => {
            prisma.flashcardSet.findUnique.mockResolvedValue(mockFlashcardSet);

            const response = await request(app).get('/api/flashcards/set/1?shuffle=true');

            expect(response.status).toBe(200);
            expect(response.body).toHaveLength(mockFlashcardSet.cards.length);
            // Additional checks can be added to ensure the order is different if needed
        });

        it('should return 500 if an error occurs', async () => {
            prisma.flashcardSet.findUnique.mockRejectedValue(new Error('Database error'));

            const response = await request(app).get('/api/flashcards/set/1');

            expect(response.status).toBe(500);
            expect(response.body).toEqual({ error: 'Database error' });
        });
    });

    describe('Unauthorized Access', () => {
        beforeEach(() => {
            authenticate.mockImplementation((req, res, next) => {
                res.status(401).json({ error: 'Please authenticate.' });
            });
        });

        it('should return 401 if user is not authenticated for getAllFlashcards', async () => {
            const response = await request(app).get('/api/flashcards');

            expect(response.status).toBe(401);
            expect(response.body).toEqual({ error: 'Please authenticate.' });
        });

        it('should return 401 if user is not authenticated for createFlashcard', async () => {
            const response = await request(app)
                .post('/api/flashcards')
                .send({ setId: 1, question: 'Test Question', answer: 'Test Answer', difficulty: 'EASY' });

            expect(response.status).toBe(401);
            expect(response.body).toEqual({ error: 'Please authenticate.' });
        });

        it('should return 401 if user is not authenticated for updateFlashcard', async () => {
            const response = await request(app)
                .put('/api/flashcards/1')
                .send({ question: 'Updated Question', answer: 'Updated Answer' });

            expect(response.status).toBe(401);
            expect(response.body).toEqual({ error: 'Please authenticate.' });
        });

        it('should return 401 if user is not authenticated for deleteFlashcard', async () => {
            const response = await request(app).delete('/api/flashcards/1');

            expect(response.status).toBe(401);
            expect(response.body).toEqual({ error: 'Please authenticate.' });
        });

        it('should return 401 if user is not authenticated for getFlashcardsInSet', async () => {
            const response = await request(app).get('/api/flashcards/set/1');

            expect(response.status).toBe(401);
            expect(response.body).toEqual({ error: 'Please authenticate.' });
        });
    });

    describe('Invalid Input', () => {
        it('should return 400 if setId is not a number for createFlashcard', async () => {
            prisma.flashcardSet.findUnique.mockResolvedValue(mockFlashcardSet);

            const response = await request(app)
                .post('/api/flashcards')
                .send({ setId: 'invalid', question: 'Test Question', answer: 'Test Answer', difficulty: 'EASY' });

            expect(response.status).toBe(400);
            expect(response.body).toEqual({ error: 'Invalid setId provided' });
        });

        it('should return 400 if setId is not a number for getFlashcardsInSet', async () => {
            const response = await request(app).get('/api/flashcards/set/invalid');

            expect(response.status).toBe(400);
            expect(response.body).toEqual({ error: 'Invalid setId provided' });
        });
    });

    describe('Empty Flashcard Sets', () => {
        it('should return 200 and a message if no flashcards are found in the set', async () => {
            prisma.flashcardSet.findUnique.mockResolvedValue({ ...mockFlashcardSet, cards: [] });
    
            const response = await request(app).get('/api/flashcards/set/1');
    
            expect(response.status).toBe(200);
            expect(response.body).toEqual({ message: 'No flashcards found. Please create a new flashcard.' });
        });
    });
});