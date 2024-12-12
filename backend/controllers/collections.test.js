const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const { getUserCollections, getCollectionById, createCollection, updateCollectionById, deleteCollectionById } = require('../controllers/collectionController');
const prisma = require('../prisma');
const { authenticate } = require('../middleware/authenticate');

jest.mock('../prisma');
jest.mock('../middleware/authenticate');

const app = express();
app.use(bodyParser.json());
app.use(authenticate);
app.get('/api/collections', getUserCollections);
app.get('/api/collections/:collectionId', getCollectionById);
app.post('/api/collections', createCollection);
app.put('/api/collections/:collectionId', updateCollectionById);
app.delete('/api/collections/:collectionId', deleteCollectionById);

describe('Collection Controller', () => {
    const mockUser = { id: 1, username: 'testUser', admin: false };
    const mockCollection = { id: 1, comment: 'Test Collection', userId: 1, flashcardSets: [] };
    const mockFlashcardSets = [{ id: 1, name: 'Set 1' }, { id: 2, name: 'Set 2' }];

    beforeEach(() => {
        authenticate.mockImplementation((req, res, next) => {
            req.user = mockUser;
            next();
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('getUserCollections', () => {
        it('should return 200 and the user collections', async () => {
            prisma.collection.findMany.mockResolvedValue([mockCollection]);

            const response = await request(app).get('/api/collections');

            expect(response.status).toBe(200);
            expect(response.body).toEqual([mockCollection]);
        });

        it('should return 500 if an error occurs', async () => {
            prisma.collection.findMany.mockRejectedValue(new Error('Database error'));

            const response = await request(app).get('/api/collections');

            expect(response.status).toBe(500);
            expect(response.body).toEqual({ error: 'Database error' });
        });

        it('should return 200 and an empty array if no collections are found', async () => {
            prisma.collection.findMany.mockResolvedValue([]);

            const response = await request(app).get('/api/collections');

            expect(response.status).toBe(200);
            expect(response.body).toEqual([]);
        });
    });

    describe('getCollectionById', () => {
        it('should return 200 and the collection for a valid collectionId', async () => {
            prisma.collection.findUnique.mockResolvedValue(mockCollection);

            const response = await request(app).get('/api/collections/1');

            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockCollection);
        });

        it('should return 404 if collection is not found', async () => {
            prisma.collection.findUnique.mockResolvedValue(null);

            const response = await request(app).get('/api/collections/999');

            expect(response.status).toBe(404);
            expect(response.body).toEqual({ error: 'Collection not found' });
        });

        it('should return 500 if an error occurs', async () => {
            prisma.collection.findUnique.mockRejectedValue(new Error('Database error'));

            const response = await request(app).get('/api/collections/1');

            expect(response.status).toBe(500);
            expect(response.body).toEqual({ error: 'Database error' });
        });
    });

    describe('createCollection', () => {
        it('should return 201 and the created collection for a valid request', async () => {
            prisma.flashcardSet.findMany.mockResolvedValue(mockFlashcardSets);
            prisma.collection.create.mockResolvedValue(mockCollection);

            const response = await request(app)
                .post('/api/collections')
                .send({ comment: 'Test Collection', setIds: [1, 2] });

            expect(response.status).toBe(201);
            expect(response.body).toEqual(mockCollection);
        });

        it('should return 400 if comment or setIds are missing', async () => {
            const response = await request(app)
                .post('/api/collections')
                .send({ comment: 'Test Collection' });

            expect(response.status).toBe(400);
            expect(response.body).toEqual({ error: 'Comment and at least one setId are required' });
        });

        it('should return 400 if one or more flashcard sets are invalid', async () => {
            prisma.flashcardSet.findMany.mockResolvedValue([mockFlashcardSets[0]]);

            const response = await request(app)
                .post('/api/collections')
                .send({ comment: 'Test Collection', setIds: [1, 2] });

            expect(response.status).toBe(400);
            expect(response.body).toEqual({ error: 'One or more flashcard sets are invalid' });
        });

        it('should return 500 if an error occurs', async () => {
            prisma.flashcardSet.findMany.mockRejectedValue(new Error('Database error'));

            const response = await request(app)
                .post('/api/collections')
                .send({ comment: 'Test Collection', setIds: [1, 2] });

            expect(response.status).toBe(500);
            expect(response.body).toEqual({ error: 'Database error' });
        });
    });

    describe('updateCollectionById', () => {
        it('should return 200 and the updated collection for a valid request', async () => {
            prisma.collection.findUnique.mockResolvedValue(mockCollection);
            prisma.flashcardSet.findMany.mockResolvedValue(mockFlashcardSets);
            prisma.collection.update.mockResolvedValue(mockCollection);

            const response = await request(app)
                .put('/api/collections/1')
                .send({ comment: 'Updated Collection', setIds: [1, 2] });

            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockCollection);
        });

        it('should return 404 if collection is not found', async () => {
            prisma.collection.findUnique.mockResolvedValue(null);

            const response = await request(app)
                .put('/api/collections/999')
                .send({ comment: 'Updated Collection', setIds: [1, 2] });

            expect(response.status).toBe(404);
            expect(response.body).toEqual({ error: 'Collection not found or user not authorized' });
        });

        it('should return 400 if some flashcard sets do not exist', async () => {
            prisma.collection.findUnique.mockResolvedValue(mockCollection);
            prisma.flashcardSet.findMany.mockResolvedValue([mockFlashcardSets[0]]);

            const response = await request(app)
                .put('/api/collections/1')
                .send({ comment: 'Updated Collection', setIds: [1, 2] });

            expect(response.status).toBe(400);
            expect(response.body).toEqual({ error: 'Some flashcard sets do not exist' });
        });

        it('should return 500 if an error occurs', async () => {
            prisma.collection.findUnique.mockResolvedValue(mockCollection);
            prisma.flashcardSet.findMany.mockRejectedValue(new Error('Database error'));

            const response = await request(app)
                .put('/api/collections/1')
                .send({ comment: 'Updated Collection', setIds: [1, 2] });

            expect(response.status).toBe(500);
            expect(response.body).toEqual({ error: 'Database error' });
        });
    });

    describe('deleteCollectionById', () => {
        it('should return 204 for a successful deletion', async () => {
            prisma.collection.findUnique.mockResolvedValue(mockCollection);
            prisma.collection.delete.mockResolvedValue({});

            const response = await request(app).delete('/api/collections/1');

            expect(response.status).toBe(204);
        });

        it('should return 404 if collection is not found', async () => {
            prisma.collection.findUnique.mockResolvedValue(null);

            const response = await request(app).delete('/api/collections/999');

            expect(response.status).toBe(404);
            expect(response.body).toEqual({ error: 'Collection not found' });
        });

        it('should return 500 if an error occurs', async () => {
            prisma.collection.findUnique.mockResolvedValue(mockCollection);
            prisma.collection.delete.mockRejectedValue(new Error('Database error'));

            const response = await request(app).delete('/api/collections/1');

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

        it('should return 401 if user is not authenticated for getUserCollections', async () => {
            const response = await request(app).get('/api/collections');

            expect(response.status).toBe(401);
            expect(response.body).toEqual({ error: 'Please authenticate.' });
        });

        it('should return 401 if user is not authenticated for getCollectionById', async () => {
            const response = await request(app).get('/api/collections/1');

            expect(response.status).toBe(401);
            expect(response.body).toEqual({ error: 'Please authenticate.' });
        });

        it('should return 401 if user is not authenticated for createCollection', async () => {
            const response = await request(app)
                .post('/api/collections')
                .send({ comment: 'Test Collection', setIds: [1, 2] });

            expect(response.status).toBe(401);
            expect(response.body).toEqual({ error: 'Please authenticate.' });
        });

        it('should return 401 if user is not authenticated for updateCollectionById', async () => {
            const response = await request(app)
                .put('/api/collections/1')
                .send({ comment: 'Updated Collection', setIds: [1, 2] });

            expect(response.status).toBe(401);
            expect(response.body).toEqual({ error: 'Please authenticate.' });
        });

        it('should return 401 if user is not authenticated for deleteCollectionById', async () => {
            const response = await request(app).delete('/api/collections/1');

            expect(response.status).toBe(401);
            expect(response.body).toEqual({ error: 'Please authenticate.' });
        });
    });
});