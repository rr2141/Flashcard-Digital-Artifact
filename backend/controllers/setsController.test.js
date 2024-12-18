// setsController.test.js

const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const { 
    getAllFlashcardSets, 
    getFlashcardSetbyID, 
    createFlashcardSet, 
    updateFlashcardSet, 
    deleteFlashcardSet, 
    addCommentToSet, 
    getCommentsForSet 
} = require('../controllers/setController');
const prisma = require('../prisma');
const { authenticate } = require('../middleware/authenticate');

jest.mock('../prisma');
jest.mock('../middleware/authenticate');

const app = express();
app.use(bodyParser.json());
app.use(authenticate);

app.get('/api/flashcardSets', getAllFlashcardSets);
app.get('/api/flashcardSets/:setId', getFlashcardSetbyID);
app.post('/api/flashcardSets', createFlashcardSet);
app.put('/api/flashcardSets/:setId', updateFlashcardSet);
app.delete('/api/flashcardSets/:setId', deleteFlashcardSet);
app.post('/api/flashcardSets/:setId/comments', addCommentToSet);
app.get('/api/flashcardSets/:setId/comments', getCommentsForSet);

describe('Set Controller', () => {
    const mockUser = { id: 1, username: 'testUser', admin: false };
    const mockFlashcardSet = { id: 1, name: 'Test Set', userId: 1, cards: [], comments: [] };
    const mockComment = { 
        id: 1, 
        comment: 'Test Comment', 
        setId: 1, 
        user: { id: 1, username: 'testUser' }, 
        createdAt: new Date().toISOString(),
    };

    beforeEach(() => {
        authenticate.mockImplementation((req, res, next) => {
            req.user = mockUser;
            next();
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('getAllFlashcardSets', () => {
        it('should return 200 and all flashcard sets', async () => {
            prisma.flashcardSet.findMany.mockResolvedValue([mockFlashcardSet]);

            const response = await request(app).get('/api/flashcardSets');

            expect(response.status).toBe(200);
            expect(response.body).toEqual([mockFlashcardSet]);
        });

        it('should return 404 if no flashcard sets are found', async () => {
            prisma.flashcardSet.findMany.mockResolvedValue([]);

            const response = await request(app).get('/api/flashcardSets');

            expect(response.status).toBe(404);
            expect(response.body).toEqual({ error: 'No flashcard sets found' });
        });

        it('should return 500 if an error occurs', async () => {
            prisma.flashcardSet.findMany.mockRejectedValue(new Error('Internal Server Error'));

            const response = await request(app).get('/api/flashcardSets');

            expect(response.status).toBe(500);
            expect(response.body).toEqual({ error: 'Internal Server Error' });
        });
    });

    describe('getFlashcardSetbyID', () => {
        it('should return 200 and the flashcard set for a valid setId', async () => {
            prisma.flashcardSet.findUnique.mockResolvedValue(mockFlashcardSet);

            const response = await request(app).get('/api/flashcardSets/1');

            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockFlashcardSet);
        });

        it('should return 400 if setId is not a number', async () => {
            const response = await request(app).get('/api/flashcardSets/invalid');

            expect(response.status).toBe(400);
            expect(response.body).toEqual({ error: 'Invalid setID provided.' });
        });

        it('should return 404 if flashcard set is not found', async () => {
            prisma.flashcardSet.findUnique.mockResolvedValue(null);

            const response = await request(app).get('/api/flashcardSets/999');

            expect(response.status).toBe(404);
            expect(response.body).toEqual({ error: 'Flashcard set not found' });
        });

        it('should return 500 if an error occurs', async () => {
            prisma.flashcardSet.findUnique.mockRejectedValue(new Error('Database error'));

            const response = await request(app).get('/api/flashcardSets/1');

            expect(response.status).toBe(500);
            expect(response.body).toEqual({ error: 'Database error' });
        });
    });

    describe('createFlashcardSet', () => {
        it('should return 201 and the created flashcard set for a valid request', async () => {
            prisma.flashcardSet.count.mockResolvedValue(0);
            prisma.flashcardSet.create.mockResolvedValue(mockFlashcardSet);

            const response = await request(app)
                .post('/api/flashcardSets')
                .send({ name: 'Test Set' });

            expect(response.status).toBe(201);
            expect(response.body).toEqual(mockFlashcardSet);
        });

        it('should return 400 if name is missing', async () => {
            const response = await request(app)
                .post('/api/flashcardSets')
                .send({});

            expect(response.status).toBe(400);
            expect(response.body).toEqual({ error: 'Name is required' });
        });

        it('should return 429 if the user has exceeded the daily limit', async () => {
            prisma.flashcardSet.count.mockResolvedValue(20);

            const response = await request(app)
                .post('/api/flashcardSets')
                .send({ name: 'Test Set' });

            expect(response.status).toBe(429);
            expect(response.body).toEqual({ 
                error: 'You have reached the maximum number of flashcard sets allowed today. Please try again tomorrow.' 
            });
        });

        it('should return 500 if an error occurs', async () => {
            prisma.flashcardSet.count.mockResolvedValue(0);
            prisma.flashcardSet.create.mockRejectedValue(new Error('Database error'));

            const response = await request(app)
                .post('/api/flashcardSets')
                .send({ name: 'Test Set' });

            expect(response.status).toBe(500);
            expect(response.body).toEqual({ error: 'Database error' });
        });
    });

    describe('updateFlashcardSet', () => {
        it('should return 200 and the updated flashcard set for a valid request', async () => {
            prisma.flashcardSet.findUnique.mockResolvedValue(mockFlashcardSet);
            prisma.flashcardSet.update.mockResolvedValue(mockFlashcardSet);

            const response = await request(app)
                .put('/api/flashcardSets/1')
                .send({ name: 'Updated Set', cards: [] });

            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockFlashcardSet);
        });

        it('should return 400 if name is missing', async () => {
            prisma.flashcardSet.findUnique.mockResolvedValue(mockFlashcardSet);

            const response = await request(app)
                .put('/api/flashcardSets/1')
                .send({ cards: [] });

            expect(response.status).toBe(400);
            expect(response.body).toEqual({ error: 'Name is required' });
        });

        it('should return 404 if flashcard set is not found', async () => {
            prisma.flashcardSet.findUnique.mockResolvedValue(null);

            const response = await request(app)
                .put('/api/flashcardSets/999')
                .send({ name: 'Updated Set', cards: [] });

            expect(response.status).toBe(404);
            expect(response.body).toEqual({ error: 'The flashcard set was not found' });
        });

        it('should return 500 if an error occurs', async () => {
            prisma.flashcardSet.findUnique.mockResolvedValue(mockFlashcardSet);
            prisma.flashcardSet.update.mockRejectedValue(new Error('Database error'));

            const response = await request(app)
                .put('/api/flashcardSets/1')
                .send({ name: 'Updated Set', cards: [] });

            expect(response.status).toBe(500);
            expect(response.body).toEqual({ error: 'Database error' });
        });
    });

    describe('deleteFlashcardSet', () => {
        it('should return 204 for a successful deletion', async () => {
            prisma.flashcardSet.findUnique.mockResolvedValue(mockFlashcardSet);
            prisma.flashcard.deleteMany.mockResolvedValue({});
            prisma.flashcardSet.delete.mockResolvedValue({});

            const response = await request(app).delete('/api/flashcardSets/1');

            expect(response.status).toBe(204);
            expect(response.body).toEqual({});
        });

        it('should return 404 if flashcard set is not found', async () => {
            prisma.flashcardSet.findUnique.mockResolvedValue(null);

            const response = await request(app).delete('/api/flashcardSets/999');

            expect(response.status).toBe(404);
            expect(response.body).toEqual({ error: 'The flashcard set was not found' });
        });

        it('should return 500 if an error occurs', async () => {
            prisma.flashcardSet.findUnique.mockResolvedValue(mockFlashcardSet);
            prisma.flashcardSet.delete.mockRejectedValue(new Error('Database error'));

            const response = await request(app).delete('/api/flashcardSets/1');

            expect(response.status).toBe(500);
            expect(response.body).toEqual({ error: 'Database error' });
        });
    });

    describe('addCommentToSet', () => {
        const mockCommentWithUser = { 
            id: 1, 
            comment: 'Test Comment', 
            setId: 1, 
            user: { id: 1, username: 'testUser' }, 
            createdAt: new Date().toISOString(),
        };
    
        it('should return 201 and the created comment for a valid request', async () => {
            prisma.flashcardSet.findUnique.mockResolvedValue(mockFlashcardSet);
            prisma.comment.create.mockResolvedValue(mockCommentWithUser);
    
            const response = await request(app)
                .post('/api/flashcardSets/1/comments')
                .send({ comment: 'Test Comment' });
    
            expect(response.status).toBe(201);
            expect(response.body).toEqual(mockCommentWithUser);
        });
    
        it('should return 400 if comment is missing', async () => {
            prisma.flashcardSet.findUnique.mockResolvedValue(mockFlashcardSet);
    
            const response = await request(app)
                .post('/api/flashcardSets/1/comments')
                .send({ comment: '' });
    
            expect(response.status).toBe(400);
            expect(response.body).toEqual({ error: 'Comment cannot be empty' });
        });
    
        it('should return 404 if flashcard set is not found', async () => {
            prisma.flashcardSet.findUnique.mockResolvedValue(null);
    
            const response = await request(app)
                .post('/api/flashcardSets/999/comments')
                .send({ comment: 'Test Comment' });
    
            expect(response.status).toBe(404);
            expect(response.body).toEqual({ error: 'Flashcard set not found' });
        });
    
        it('should return 500 if an error occurs', async () => {
            prisma.flashcardSet.findUnique.mockResolvedValue(mockFlashcardSet);
            prisma.comment.create.mockRejectedValue(new Error('Database error'));
    
            const response = await request(app)
                .post('/api/flashcardSets/1/comments')
                .send({ comment: 'Test Comment' });
    
            expect(response.status).toBe(500);
            expect(response.body).toEqual({ error: 'Error adding comment to set' });
        });
    });

    describe('getCommentsForSet', () => {
        it('should return 200 and all comments for a valid setId', async () => {
            prisma.flashcardSet.findUnique.mockResolvedValue(mockFlashcardSet);
            prisma.comment.findMany.mockResolvedValue([mockComment]);

            const response = await request(app).get('/api/flashcardSets/1/comments');

            expect(response.status).toBe(200);
            expect(response.body).toEqual([mockComment]);
        });

        it('should return 404 if no comments are found for the set', async () => {
            prisma.flashcardSet.findUnique.mockResolvedValue(mockFlashcardSet);
            prisma.comment.findMany.mockResolvedValue([]);

            const response = await request(app).get('/api/flashcardSets/1/comments');

            expect(response.status).toBe(404);
            expect(response.body).toEqual({ error: 'No comments found for this set' });
        });

        it('should return 500 if an error occurs', async () => {
            prisma.flashcardSet.findUnique.mockResolvedValue(mockFlashcardSet);
            prisma.comment.findMany.mockRejectedValue(new Error('Database error'));

            const response = await request(app).get('/api/flashcardSets/1/comments');

            expect(response.status).toBe(500);
            expect(response.body).toEqual({ error: 'Error fetching comments' });
        });
    });

    describe('Unauthorized Access', () => {
        beforeEach(() => {
            authenticate.mockImplementation((req, res, next) => {
                res.status(401).json({ error: 'Please authenticate.' });
            });
        });

        it('should return 401 if user is not authenticated for getAllFlashcardSets', async () => {
            const response = await request(app).get('/api/flashcardSets');

            expect(response.status).toBe(401);
            expect(response.body).toEqual({ error: 'Please authenticate.' });
        });

        it('should return 401 if user is not authenticated for getFlashcardSetbyID', async () => {
            const response = await request(app).get('/api/flashcardSets/1');

            expect(response.status).toBe(401);
            expect(response.body).toEqual({ error: 'Please authenticate.' });
        });

        it('should return 401 if user is not authenticated for createFlashcardSet', async () => {
            const response = await request(app)
                .post('/api/flashcardSets')
                .send({ name: 'Test Set' });

            expect(response.status).toBe(401);
            expect(response.body).toEqual({ error: 'Please authenticate.' });
        });

        it('should return 401 if user is not authenticated for updateFlashcardSet', async () => {
            const response = await request(app)
                .put('/api/flashcardSets/1')
                .send({ name: 'Updated Set', cards: [] });

            expect(response.status).toBe(401);
            expect(response.body).toEqual({ error: 'Please authenticate.' });
        });

        it('should return 401 if user is not authenticated for deleteFlashcardSet', async () => {
            const response = await request(app).delete('/api/flashcardSets/1');

            expect(response.status).toBe(401);
            expect(response.body).toEqual({ error: 'Please authenticate.' });
        });

        it('should return 401 if user is not authenticated for addCommentToSet', async () => {
            const response = await request(app)
                .post('/api/flashcardSets/1/comments')
                .send({ comment: 'Test Comment' });

            expect(response.status).toBe(401);
            expect(response.body).toEqual({ error: 'Please authenticate.' });
        });

        it('should return 401 if user is not authenticated for getCommentsForSet', async () => {
            const response = await request(app).get('/api/flashcardSets/1/comments');

            expect(response.status).toBe(401);
            expect(response.body).toEqual({ error: 'Please authenticate.' });
        });
    });
});