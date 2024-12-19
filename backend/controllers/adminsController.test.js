const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const adminsController = require('../controllers/adminsController');
const prisma = require('../prisma'); // Adjust the path to your Prisma client

const app = express();
app.use(bodyParser.json());

// Mock routes
app.get('/api/admins/users', adminsController.getAllUsers);
app.delete('/api/admins/users/:userId', adminsController.deleteUserById);
app.get('/api/admins/set-limit', adminsController.getSetLimit);
app.put('/api/admins/set-limit', adminsController.updateSetLimit);

// Mock Prisma client
jest.mock('../prisma', () => ({
  user: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    delete: jest.fn(),
  },
  settings: {
    findFirst: jest.fn(),
    upsert: jest.fn(),
  },
}));

describe('Admins Controller', () => {
  describe('getAllUsers', () => {
    it('should return all users', async () => {
      const mockUsers = [{ id: 1, username: 'user1' }, { id: 2, username: 'user2' }];
      prisma.user.findMany.mockResolvedValue(mockUsers);

      const response = await request(app).get('/api/admins/users');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockUsers);
    });

    it('should handle errors', async () => {
      prisma.user.findMany.mockRejectedValue(new Error('Database error'));

      const response = await request(app).get('/api/admins/users');

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Database error' });
    });
  });

  describe('deleteUserById', () => {
    it('should delete a user by ID', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 1, username: 'user1' });
      prisma.user.delete.mockResolvedValue({});

      const response = await request(app).delete('/api/admins/users/1');

      expect(response.status).toBe(204);
    });

    it('should return 404 if user not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      const response = await request(app).delete('/api/admins/users/1');

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'User not found' });
    });

    it('should handle errors', async () => {
      prisma.user.findUnique.mockRejectedValue(new Error('Database error'));

      const response = await request(app).delete('/api/admins/users/1');

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Database error' });
    });
  });

  describe('getSetLimit', () => {
    it('should return the set limit', async () => {
      prisma.settings.findFirst.mockResolvedValue({ dailyLimit: 20 });

      const response = await request(app).get('/api/admins/set-limit');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ dailyLimit: 20 });
    });

    it('should return default limit if no settings found', async () => {
      prisma.settings.findFirst.mockResolvedValue(null);

      const response = await request(app).get('/api/admins/set-limit');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ dailyLimit: 20 });
    });

    it('should handle errors', async () => {
      prisma.settings.findFirst.mockRejectedValue(new Error('Database error'));

      const response = await request(app).get('/api/admins/set-limit');

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Internal server error' });
    });
  });

  describe('updateSetLimit', () => {
    it('should update the set limit', async () => {
      prisma.settings.upsert.mockResolvedValue({ dailyLimit: 25 });

      const response = await request(app)
        .put('/api/admins/set-limit')
        .send({ dailyLimit: 25 });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ dailyLimit: 25 });
    });

    it('should return 400 for invalid dailyLimit', async () => {
      const response = await request(app)
        .put('/api/admins/set-limit')
        .send({ dailyLimit: -1 });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Invalid dailyLimit value' });
    });

    it('should handle errors', async () => {
      prisma.settings.upsert.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .put('/api/admins/set-limit')
        .send({ dailyLimit: 25 });

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Internal server error' });
    });
  });
});