const prisma = require('../prisma');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const request = require('supertest');
const app = require('../app'); 

const userController = require('../controllers/userController');


jest.mock('../prisma', () => ({
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  flashcardSet: {
    findMany: jest.fn(),
  },
}));

jest.mock('bcryptjs', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
  genSalt: jest.fn(),
}));

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(),
}));

describe('User Controller', () => {
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
      expect(response.body).toHaveProperty('token', 'fakeToken');
      expect(response.body.user).toEqual({
        id: mockUser.id,
        username: mockUser.username,
        admin: mockUser.admin,
      });
    });

    it('should return 400 if username or password is missing', async () => {
      const response = await request(app)
        .post('/api/users/login')
        .send({ username: '', password: '' });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Username and password are required');
    });

    it('should return 404 if user is not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      const response = await request(app)
        .post('/api/users/login')
        .send({ username: 'testUser', password: 'password123' });

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Invalid username or password');
    });

    it('should return 401 if password is incorrect', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(false);

      const response = await request(app)
        .post('/api/users/login')
        .send({ username: 'testUser', password: 'wrongPassword' });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error', 'Invalid username or password');
    });

    it('should return 500 if there is a server error', async () => {
      prisma.user.findUnique.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .post('/api/users/login')
        .send({ username: 'testUser', password: 'password123' });

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error', 'Internal server error');
    });
  });

  describe('createUser', () => {
    it('should create a new user and return 201', async () => {
      const newUser = {
        id: 1,
        username: 'newUser',
        password: 'hashedPassword',
        admin: false,
      };
      req.body = { username: 'newUser', password: 'password123', admin: false };
      bcrypt.hash.mockResolvedValue('hashedPassword');
      prisma.user.create.mockResolvedValue(newUser);

      await userController.createUser(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: 'User created successfully',
        user: {
          id: newUser.id,
          username: newUser.username,
          admin: newUser.admin,
        },
      });
    });

    it('should return 400 if username or password is missing', async () => {
      req.body = { username: '', password: '' };

      await userController.createUser(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Username and password are required' });
    });

    it('should return 400 if username or password format is invalid', async () => {
      req.body = { username: 'us', password: '123' };

      await userController.createUser(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Invalid username or password format' });
    });

    it('should return 409 if username already exists', async () => {
      const error = { code: 'P2002' };
      req.body = { username: 'existingUser', password: 'password123' };
      bcrypt.hash.mockResolvedValue('hashedPassword');
      prisma.user.create.mockRejectedValue(error);

      await userController.createUser(req, res);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({ error: 'Username already exists' });
    });

    it('should return 500 if there is a server error', async () => {
      const error = new Error('Database error');
      req.body = { username: 'newUser', password: 'password123' };
      bcrypt.hash.mockResolvedValue('hashedPassword');
      prisma.user.create.mockRejectedValue(error);

      await userController.createUser(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' });
    });
  });

  describe('getUserById', () => {
    it('should return a user by ID', async () => {
      const user = { id: 1, username: 'testUser', admin: false };
      req.params.userId = 1;
      prisma.user.findUnique.mockResolvedValue(user);

      await userController.getUserById(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(user);
    });

    it('should return 404 if user is not found', async () => {
      req.params.userId = 1;
      prisma.user.findUnique.mockResolvedValue(null);

      await userController.getUserById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'User not found' });
    });

    it('should return 400 if userId is invalid', async () => {
      req.params.userId = 'invalid';

      await userController.getUserById(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Invalid user ID format' });
    });

    it('should return 500 if there is a server error', async () => {
      const error = new Error('Database error');
      req.params.userId = 1;
      prisma.user.findUnique.mockRejectedValue(error);

      await userController.getUserById(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: error.message });
    });
  });

  describe('updateUserById', () => {
    it('should update a user by ID', async () => {
      const user = { id: 1, username: 'testUser', password: 'hashedPassword', admin: false };
      const updatedUser = { id: 1, username: 'updatedUser', password: 'hashedPassword', admin: false };
      req.params.userId = 1;
      req.body = { username: 'updatedUser' };
      prisma.user.findUnique.mockResolvedValue(user);
      prisma.user.update.mockResolvedValue(updatedUser);

      await userController.updateUserById(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(updatedUser);
    });

    it('should return 404 if user is not found', async () => {
      req.params.userId = 1;
      req.body = { username: 'updatedUser' };
      prisma.user.findUnique.mockResolvedValue(null);

      await userController.updateUserById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'User not found' });
    });

    it('should return 403 if non-admin tries to update admin status', async () => {
      const user = { id: 1, username: 'testUser', password: 'hashedPassword', admin: false };
      req.params.userId = 1;
      req.body = { admin: true };
      req.user.admin = false;
      prisma.user.findUnique.mockResolvedValue(user);

      await userController.updateUserById(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ error: 'You are not allowed to update admin status' });
    });

    it('should return 500 if there is a server error', async () => {
      const error = new Error('Database error');
      req.params.userId = 1;
      req.body = { username: 'updatedUser' };
      prisma.user.findUnique.mockRejectedValue(error);

      await userController.updateUserById(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: error.message });
    });
  });

  describe('getUserFlashcardSets', () => {
    it('should return all flashcard sets for a user', async () => {
      const sets = [{ id: 1, name: 'Test Set' }];
      req.params.userId = 1;
      prisma.flashcardSet.findMany.mockResolvedValue(sets);

      await userController.getUserFlashcardSets(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(sets);
    });

    it('should return 404 if user is not found', async () => {
      req.params.userId = 1;
      prisma.user.findUnique.mockResolvedValue(null);

      await userController.getUserFlashcardSets(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'User not found' });
    });

    it('should return 400 if userId is invalid', async () => {
      req.params.userId = 'invalid';

      await userController.getUserFlashcardSets(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Invalid user ID format' });
    });

    it('should return 500 if there is a server error', async () => {
      const error = new Error('Database error');
      req.params.userId = 1;
      prisma.flashcardSet.findMany.mockRejectedValue(error);

      await userController.getUserFlashcardSets(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: error.message });
    });
  });

  describe('updatePassword', () => {
    it('should update the user password', async () => {
      const user = { id: 1, password: 'hashedPassword' };
      req.body = { currentPassword: 'password123', newPassword: 'newPassword123' };
      prisma.user.findUnique.mockResolvedValue(user);
      bcrypt.compare.mockResolvedValue(true);
      bcrypt.genSalt.mockResolvedValue('salt');
      bcrypt.hash.mockResolvedValue('newHashedPassword');

      await userController.updatePassword(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Password updated successfully' });
    });

    it('should return 404 if user is not found', async () => {
      req.body = { currentPassword: 'password123', newPassword: 'newPassword123' };
      prisma.user.findUnique.mockResolvedValue(null);

      await userController.updatePassword(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'User not found' });
    });

    it('should return 400 if current password is incorrect', async () => {
      const user = { id: 1, password: 'hashedPassword' };
      req.body = { currentPassword: 'wrongPassword', newPassword: 'newPassword123' };
      prisma.user.findUnique.mockResolvedValue(user);
      bcrypt.compare.mockResolvedValue(false);

      await userController.updatePassword(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Current password is incorrect' });
    });

    it('should return 500 if there is a server error', async () => {
      const error = new Error('Database error');
      req.body = { currentPassword: 'password123', newPassword: 'newPassword123' };
      prisma.user.findUnique.mockRejectedValue(error);

      await userController.updatePassword(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: error.message });
    });
  });
});