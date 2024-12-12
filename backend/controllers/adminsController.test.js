const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const { getAdminDashboard, getAllUsers, deleteUserById } = require('../controllers/adminsController');
const prisma = require('../prisma');
const { authenticate } = require('../middleware/authenticate');
const { isAdmin } = require('../middleware/admin');

jest.mock('../prisma');
jest.mock('../middleware/authenticate');
jest.mock('../middleware/admin');

const app = express();
app.use(bodyParser.json());
app.use(authenticate);
app.use(isAdmin);
app.get('/api/admin/dashboard', getAdminDashboard);
app.get('/api/admin/users', getAllUsers);
app.delete('/api/admin/users/:userId', deleteUserById);

describe('Admins Controller', () => {
    const mockUser = { id: 1, username: 'adminUser', admin: true };
    const mockNonAdminUser = { id: 2, username: 'regularUser', admin: false };
    const mockUsers = [{ id: 1, username: 'user1' }, { id: 2, username: 'user2' }];

    beforeEach(() => {
        authenticate.mockImplementation((req, res, next) => {
            req.user = mockUser;
            next();
        });
        isAdmin.mockImplementation((req, res, next) => {
            if (!req.user.admin) {
                return res.status(403).json({ error: 'Access denied' });
            }
            next();
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('getAdminDashboard', () => {
        it('should return 200 and admin-specific data', async () => {
            const mockData = [{ id: 1, name: 'Data1' }, { id: 2, name: 'Data2' }];
            prisma.someModel.findMany.mockResolvedValue(mockData);

            const response = await request(app).get('/api/admin/dashboard');

            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockData);
        });

        it('should return 500 if an error occurs', async () => {
            prisma.someModel.findMany.mockRejectedValue(new Error('Database error'));

            const response = await request(app).get('/api/admin/dashboard');

            expect(response.status).toBe(500);
            expect(response.body).toEqual({ error: 'Database error' });
        });
    });

    describe('getAllUsers', () => {
        it('should return 200 and all users', async () => {
            prisma.user.findMany.mockResolvedValue(mockUsers);

            const response = await request(app).get('/api/admin/users');

            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockUsers);
        });

        it('should return 500 if an error occurs', async () => {
            prisma.user.findMany.mockRejectedValue(new Error('Database error'));

            const response = await request(app).get('/api/admin/users');

            expect(response.status).toBe(500);
            expect(response.body).toEqual({ error: 'Database error' });
        });
    });

    describe('deleteUserById', () => {
        it('should return 204 for a successful deletion', async () => {
            prisma.user.findUnique.mockResolvedValue(mockUsers[0]);
            prisma.user.delete.mockResolvedValue({});

            const response = await request(app).delete('/api/admin/users/1');

            expect(response.status).toBe(204);
        });

        it('should return 404 if user is not found', async () => {
            prisma.user.findUnique.mockResolvedValue(null);

            const response = await request(app).delete('/api/admin/users/999');

            expect(response.status).toBe(404);
            expect(response.body).toEqual({ error: 'User not found' });
        });

        it('should return 500 if an error occurs', async () => {
            prisma.user.findUnique.mockResolvedValue(mockUsers[0]);
            prisma.user.delete.mockRejectedValue(new Error('Database error'));

            const response = await request(app).delete('/api/admin/users/1');

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

        it('should return 401 if user is not authenticated for getAdminDashboard', async () => {
            const response = await request(app).get('/api/admin/dashboard');

            expect(response.status).toBe(401);
            expect(response.body).toEqual({ error: 'Please authenticate.' });
        });

        it('should return 401 if user is not authenticated for getAllUsers', async () => {
            const response = await request(app).get('/api/admin/users');

            expect(response.status).toBe(401);
            expect(response.body).toEqual({ error: 'Please authenticate.' });
        });

        it('should return 401 if user is not authenticated for deleteUserById', async () => {
            const response = await request(app).delete('/api/admin/users/1');

            expect(response.status).toBe(401);
            expect(response.body).toEqual({ error: 'Please authenticate.' });
        });
    });

    describe('Admin Authorization', () => {
        beforeEach(() => {
            authenticate.mockImplementation((req, res, next) => {
                req.user = mockNonAdminUser;
                next();
            });
        });

        it('should return 403 if user is not an admin for getAdminDashboard', async () => {
            const response = await request(app).get('/api/admin/dashboard');

            expect(response.status).toBe(403);
            expect(response.body).toEqual({ error: 'Access denied' });
        });

        it('should return 403 if user is not an admin for getAllUsers', async () => {
            const response = await request(app).get('/api/admin/users');

            expect(response.status).toBe(403);
            expect(response.body).toEqual({ error: 'Access denied' });
        });

        it('should return 403 if user is not an admin for deleteUserById', async () => {
            const response = await request(app).delete('/api/admin/users/1');

            expect(response.status).toBe(403);
            expect(response.body).toEqual({ error: 'Access denied' });
        });
    });

});