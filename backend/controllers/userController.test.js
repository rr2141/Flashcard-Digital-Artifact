// Set the JWT secret before importing any modules
process.env.JWT_SECRET_KEY = 'testSecret';

const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const { loginUser, createUser, getUserById, updateUserById, getUserFlashcardSets, updatePassword } = require('./userController'); // Corrected import path
const prisma = require('../prisma');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

jest.mock('../prisma');
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');

const app = express();
app.use(bodyParser.json());
app.post('/api/users/login', loginUser);
app.post('/api/users', createUser);
app.get('/api/users/:userId', getUserById);
app.put('/api/users/:userId', (req, res, next) => {
    req.user = { admin: false }; 
    next();
}, updateUserById);
app.get('/api/users/:userId/flashcardSets', getUserFlashcardSets);
app.put('/api/users/:userId/password', (req, res, next) => {
    req.user = { id: req.params.userId }; 
    next();
}, updatePassword);


// Tests for loginUser function
describe('loginUser', () => {
    const mockUser = {
        id: 1,
        username: 'testUser',
        password: 'hashedPassword',
        admin: false,
    };

    it('should return 200 and a token for successful login', async () => {
        prisma.user.findUnique.mockResolvedValue(mockUser);
        bcrypt.compare.mockResolvedValue(true);
        jwt.sign.mockReturnValue('fakeToken');

        const response = await request(app)
            .post('/api/users/login')
            .send({ username: 'testUser', password: 'password123' });

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            message: 'Login successful',
            token: 'fakeToken',
            user: {
                id: mockUser.id,
                username: mockUser.username,
                admin: mockUser.admin,
            },
        });
    });

    it('should return 400 if username or password is missing', async () => {
        const response = await request(app)
            .post('/api/users/login')
            .send({ username: 'testUser' }); 

        expect(response.status).toBe(400);
        expect(response.body).toEqual({ error: 'Username and password are required' });
    });

    it('should return 404 if user is not found', async () => {
        prisma.user.findUnique.mockResolvedValue(null);

        const response = await request(app)
            .post('/api/users/login')
            .send({ username: 'nonExistentUser', password: 'password123' });

        expect(response.status).toBe(404);
        expect(response.body).toEqual({ error: 'Invalid username or password' });
    });

    it('should return 401 if password is incorrect', async () => {
        prisma.user.findUnique.mockResolvedValue(mockUser);
        bcrypt.compare.mockResolvedValue(false);

        const response = await request(app)
            .post('/api/users/login')
            .send({ username: 'testUser', password: 'wrongPassword' });

        expect(response.status).toBe(401);
        expect(response.body).toEqual({ error: 'Invalid username or password' });
    });

    it('should return 500 if an internal server error occurs', async () => {
        prisma.user.findUnique.mockRejectedValue(new Error('Database error'));

        const response = await request(app)
            .post('/api/users/login')
            .send({ username: 'testUser', password: 'password123' });

        expect(response.status).toBe(500);
        expect(response.body).toEqual({ error: 'Internal server error' });
    });
});

// Tests for createUser function
describe('createUser', () => {
    const mockUser = {
        id: 1,
        username: 'testUser',
        password: 'hashedPassword',
        admin: false,
    };

    it('should return 201 and the created user for successful user creation', async () => {
        bcrypt.hash.mockResolvedValue('hashedPassword');
        prisma.user.create.mockResolvedValue(mockUser);

        const response = await request(app)
            .post('/api/users')
            .send({ username: 'testUser', password: 'password123', admin: false });

        expect(response.status).toBe(201);
        expect(response.body).toEqual({
            message: 'User created successfully',
            user: {
                id: mockUser.id,
                username: mockUser.username,
                admin: mockUser.admin,
            },
        });
    });

    it('should return 400 if username or password is missing', async () => {
        const response = await request(app)
            .post('/api/users')
            .send({ username: 'testUser' }); 

        expect(response.status).toBe(400);
        expect(response.body).toEqual({ error: 'Username and password are required' });
    });

    it('should return 500 if an internal server error occurs', async () => {
        bcrypt.hash.mockRejectedValue(new Error('Hashing error'));

        const response = await request(app)
            .post('/api/users')
            .send({ username: 'testUser', password: 'password123', admin: false });

        expect(response.status).toBe(500);
        expect(response.body).toEqual({ error: 'Internal server error' });
    });

    it('should return 409 if username already exists', async () => {
        const uniqueConstraintError = new Error('Unique constraint failed');
        uniqueConstraintError.code = 'P2002';
        prisma.user.create.mockRejectedValue(uniqueConstraintError);

        const response = await request(app)
            .post('/api/users')
            .send({ username: 'testUser', password: 'password123', admin: false });

        expect(response.status).toBe(409);
        expect(response.body).toEqual({ error: 'Username already exists' });
    });

    it('should return 400 if username or password format is invalid', async () => {
        const response = await request(app)
            .post('/api/users')
            .send({ username: 'invalid username', password: 'short', admin: false });

        expect(response.status).toBe(400);
        expect(response.body).toEqual({ error: 'Invalid username or password format' });
    });

    it('should default admin to false if not provided', async () => {
        bcrypt.hash.mockResolvedValue('hashedPassword');
        prisma.user.create.mockResolvedValue({ ...mockUser, admin: false });

        const response = await request(app)
            .post('/api/users')
            .send({ username: 'testUser', password: 'password123' });

        expect(response.status).toBe(201);
        expect(response.body).toEqual({
            message: 'User created successfully',
            user: {
                id: mockUser.id,
                username: mockUser.username,
                admin: false,
            },
        });
    });
});

// Tests for getUserById function
describe('getUserById', () => {
    const mockUser = {
        id: 1,
        username: 'testUser',
        admin: false,
    };

    it('should return 200 and the user for a valid userId', async () => {
        prisma.user.findUnique.mockResolvedValue(mockUser);

        const response = await request(app)
            .get('/api/users/1');

        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockUser);
    });

    it('should return 404 if user is not found', async () => {
        prisma.user.findUnique.mockResolvedValue(null);

        const response = await request(app)
            .get('/api/users/999');

        expect(response.status).toBe(404);
        expect(response.body).toEqual({ error: 'User not found' });
    });

    it('should return 500 if an internal server error occurs', async () => {
        prisma.user.findUnique.mockRejectedValue(new Error('Database error'));

        const response = await request(app)
            .get('/api/users/1');

        expect(response.status).toBe(500);
        expect(response.body).toEqual({ error: 'Database error' });
    });

    it('should return 400 if userId is not a valid number', async () => {
        const response = await request(app)
            .get('/api/users/invalid'); 

        expect(response.status).toBe(400);
        expect(response.body).toEqual({ error: 'Invalid user ID format' });
    });

    it('should return 200 and the user for a userId as a string', async () => {
        prisma.user.findUnique.mockResolvedValue(mockUser);

        const response = await request(app)
            .get('/api/users/1'); 

        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockUser);
    });

    it('should return 400 if userId is a negative number', async () => {
        const response = await request(app)
            .get('/api/users/-1'); 

        expect(response.status).toBe(400);
        expect(response.body).toEqual({ error: 'Invalid user ID format' });
    });
});

// Tests for updateUserById function
describe('updateUserById', () => {
    const mockUser = {
        id: 1,
        username: 'testUser',
        password: 'hashedPassword',
        admin: false,
    };

    it('should return 200 and the updated user for a successful update', async () => {
        prisma.user.findUnique.mockResolvedValue(mockUser);
        prisma.user.update.mockResolvedValue({ ...mockUser, username: 'updatedUser' });

        const response = await request(app)
            .put('/api/users/1')
            .send({ username: 'updatedUser' });

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ ...mockUser, username: 'updatedUser' });
    });

    it('should return 404 if user is not found', async () => {
        prisma.user.findUnique.mockResolvedValue(null);

        const response = await request(app)
            .put('/api/users/999')
            .send({ username: 'updatedUser' });

        expect(response.status).toBe(404);
        expect(response.body).toEqual({ error: 'User not found' });
    });

    it('should return 403 if trying to update admin status without being an admin', async () => {
        prisma.user.findUnique.mockResolvedValue(mockUser);

        const response = await request(app)
            .put('/api/users/1')
            .send({ admin: true });

        expect(response.status).toBe(403);
        expect(response.body).toEqual({ error: 'You are not allowed to update admin status' });
    });

    it('should return 500 if an internal server error occurs', async () => {
        prisma.user.findUnique.mockResolvedValue(mockUser);
        prisma.user.update.mockRejectedValue(new Error('Database error'));

        const response = await request(app)
            .put('/api/users/1')
            .send({ username: 'updatedUser' });

        expect(response.status).toBe(500);
        expect(response.body).toEqual({ error: 'Database error' });
    });
});

// Tests for getUserFlashcardSets function
describe('getUserFlashcardSets', () => {
    const mockUser = {
        id: 1,
        username: 'testUser',
        admin: false,
    };

    const mockFlashcardSets = [
        {
            id: 1,
            title: 'Set 1',
            userId: 1,
            cards: [
                { id: 1, question: 'Q1', answer: 'A1', setId: 1 },
                { id: 2, question: 'Q2', answer: 'A2', setId: 1 },
            ],
        },
        {
            id: 2,
            title: 'Set 2',
            userId: 1,
            cards: [
                { id: 3, question: 'Q3', answer: 'A3', setId: 2 },
                { id: 4, question: 'Q4', answer: 'A4', setId: 2 },
            ],
        },
    ];

    it('should return 200 and the flashcard sets for a valid userId', async () => {
        prisma.user.findUnique.mockResolvedValue(mockUser);
        prisma.flashcardSet.findMany.mockResolvedValue(mockFlashcardSets);

        const response = await request(app)
            .get('/api/users/1/flashcardSets');

        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockFlashcardSets);
    });

    it('should return 404 if user is not found', async () => {
        prisma.user.findUnique.mockResolvedValue(null);

        const response = await request(app)
            .get('/api/users/999/flashcardSets'); 

        expect(response.status).toBe(404);
        expect(response.body).toEqual({ error: 'User not found' });
    });

    it('should return 500 if an internal server error occurs', async () => {
        prisma.user.findUnique.mockResolvedValue(mockUser);
        prisma.flashcardSet.findMany.mockRejectedValue(new Error('Database error'));

        const response = await request(app)
            .get('/api/users/1/flashcardSets');

        expect(response.status).toBe(500);
        expect(response.body).toEqual({ error: 'Database error' });
    });

    it('should return 400 if userId is not a valid number', async () => {
        const response = await request(app)
            .get('/api/users/invalid/flashcardSets'); 

        expect(response.status).toBe(400);
        expect(response.body).toEqual({ error: 'Invalid user ID format' });
    });

    it('should return 200 and the flashcard sets for a userId as a string', async () => {
        prisma.user.findUnique.mockResolvedValue(mockUser);
        prisma.flashcardSet.findMany.mockResolvedValue(mockFlashcardSets);

        const response = await request(app)
            .get('/api/users/1/flashcardSets'); 

        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockFlashcardSets);
    });

    it('should return 400 if userId is a negative number', async () => {
        const response = await request(app)
            .get('/api/users/-1/flashcardSets'); 

        expect(response.status).toBe(400);
        expect(response.body).toEqual({ error: 'Invalid user ID format' });
    });
   
});

