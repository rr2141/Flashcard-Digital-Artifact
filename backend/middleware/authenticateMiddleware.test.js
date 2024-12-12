const express = require('express');
const request = require('supertest');
const jwt = require('jsonwebtoken');
const { authenticate } = require('../middleware/authenticate');

jest.mock('jsonwebtoken');

const app = express();

app.get('/protected', authenticate, (req, res) => {
  res.status(200).json({ message: 'Protected route accessed' });
});

describe('authenticate Middleware', () => {
  it('should return 401 if no token is provided', async () => {
    const response = await request(app).get('/protected');

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ error: 'No authorization header' });
  });

  it('should return 401 if token is invalid', async () => {
    jwt.verify.mockImplementation(() => {
      throw new Error('Invalid token');
    });

    const response = await request(app)
      .get('/protected')
      .set('Authorization', 'Bearer invalidtoken');

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ error: 'Invalid or expired token' });
  });

  it('should return 401 if token is expired', async () => {
    jwt.verify.mockImplementation(() => {
      throw new jwt.TokenExpiredError('jwt expired', new Date());
    });

    const response = await request(app)
      .get('/protected')
      .set('Authorization', 'Bearer expiredtoken');

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ error: 'Invalid or expired token' });
  });

  it('should return 401 if token is missing Bearer prefix', async () => {
    const response = await request(app)
      .get('/protected')
      .set('Authorization', 'invalidtoken');

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ error: 'No token provided' });
  });

  it('should return 401 if token is malformed', async () => {
    jwt.verify.mockImplementation(() => {
      throw new Error('jwt malformed');
    });

    const response = await request(app)
      .get('/protected')
      .set('Authorization', 'Bearer malformedtoken');

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ error: 'Invalid or expired token' });
  });

  it('should call next if token is valid', async () => {
    const mockUser = { id: 1, username: 'testUser' };
    jwt.verify.mockImplementation(() => mockUser);

    const response = await request(app)
      .get('/protected')
      .set('Authorization', 'Bearer validtoken');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: 'Protected route accessed' });
  });

  it('should set req.user if token is valid', async () => {
    const mockUser = { id: 1, username: 'testUser' };
    jwt.verify.mockImplementation(() => mockUser);

    let user;
    app.get('/checkuser', authenticate, (req, res) => {
      user = req.user;
      res.status(200).json({ message: 'User checked' });
    });

    await request(app)
      .get('/checkuser')
      .set('Authorization', 'Bearer validtoken');

    expect(user).toEqual(mockUser);
  });
});