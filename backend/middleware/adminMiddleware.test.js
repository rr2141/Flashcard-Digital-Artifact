const express = require('express');
const request = require('supertest');
const { isAdmin } = require('../middleware/admin');

const app = express();

app.use((req, res, next) => {
    req.user = req.headers['user'] ? JSON.parse(req.headers['user']) : null;
    next();
});

app.get('/admin', isAdmin, (req, res) => {
    res.status(200).json({ message: 'Welcome, admin!' });
});

describe('isAdmin Middleware', () => {
    it('should return 401 if user is not authenticated', async () => {
        const response = await request(app).get('/admin');

        expect(response.status).toBe(401);
        expect(response.body).toEqual({ error: 'User not authenticated' });
    });

    it('should return 403 if user is authenticated but not an admin', async () => {
        const response = await request(app)
            .get('/admin')
            .set('user', JSON.stringify({ id: 1, username: 'regularUser', admin: false }));

        expect(response.status).toBe(403);
        expect(response.body).toEqual({ error: 'User is not an admin' });
    });

    it('should call next if user is authenticated and is an admin', async () => {
        const response = await request(app)
            .get('/admin')
            .set('user', JSON.stringify({ id: 1, username: 'adminUser', admin: true }));

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ message: 'Welcome, admin!' });
    });

    it('should return 403 if user is authenticated but admin property is missing', async () => {
        const response = await request(app)
            .get('/admin')
            .set('user', JSON.stringify({ id: 1, username: 'regularUser' }));

        expect(response.status).toBe(403);
        expect(response.body).toEqual({ error: 'User is not an admin' });
    });

    it('should return 403 if user is authenticated but admin property is not a boolean', async () => {
        const response = await request(app)
            .get('/admin')
            .set('user', JSON.stringify({ id: 1, username: 'regularUser', admin: 'yes' }));

        expect(response.status).toBe(403);
        expect(response.body).toEqual({ error: 'User is not an admin' });
    });

    it('should log the user object', async () => {
        const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

        await request(app)
            .get('/admin')
            .set('user', JSON.stringify({ id: 1, username: 'adminUser', admin: true }));

        expect(consoleSpy).toHaveBeenCalledWith({ id: 1, username: 'adminUser', admin: true });

        consoleSpy.mockRestore();
    });
});