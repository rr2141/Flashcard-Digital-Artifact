const request = require('supertest');
const app = require('../server'); // Your Express app instance
const prisma = require('../prisma');
const jwt = require('jsonwebtoken');

let server;
let authToken;

beforeAll(async () => {
    // Start the server on a different port to avoid conflicts
    server = app.listen(3001, () => console.log('Test server is running on http://localhost:3001'));

    // Seed the database with test data
    await prisma.user.create({
        data: {
            username: 'adminuser',
            password: 'testpassword',
            admin: true,
        },
    });

    // Generate JWT for the admin user
    authToken = jwt.sign(
        { username: 'adminuser', admin: true },  // Payload
        process.env.JWT_SECRET,  // Secret key from .env
        { expiresIn: '1h' }  // Expiry time for the token
    );
});

afterAll(async () => {
    // Clean up the database after tests
    await prisma.user.deleteMany({});
    await prisma.$disconnect();  // Disconnect Prisma client

    // Close the server after tests
    server.close(() => console.log('Test server closed'));
});

describe('User Endpoints', () => {
    test('GET /users - should fetch all users', async () => {
        const res = await request(app)
            .get('/users')
            .set('Authorization', `Bearer ${authToken}`);  // Include the token in the Authorization header
        expect(res.statusCode).toEqual(200);
        expect(res.body).toBeInstanceOf(Array);
        expect(res.body[0]).toHaveProperty('username');
    });

    test('POST /users - should create a new user', async () => {
        const res = await request(app)
            .post('/users')
            .send({
                username: 'newuser',
                password: 'password',
                admin: false,
            })
            .set('Authorization', `Bearer ${authToken}`);  // Include the token in the Authorization header
        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('username', 'newuser');
    });

    test('GET /users/:userId - should fetch a user by ID', async () => {
        const user = await prisma.user.create({
            data: { username: 'fetchuser', password: 'password', admin: false },
        });

        const res = await request(app)
            .get(`/users/${user.id}`)
            .set('Authorization', `Bearer ${authToken}`);  // Include the token in the Authorization header
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('username', 'fetchuser');
    });

    test('PUT /users/:userId - should update a user by ID', async () => {
        const user = await prisma.user.create({
            data: { username: 'updateuser', password: 'password', admin: false },
        });

        const res = await request(app)
            .put(`/users/${user.id}`)
            .send({
                username: 'updatedusername',
                admin: true,
            })
            .set('Authorization', `Bearer ${authToken}`);  // Include the token in the Authorization header
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('username', 'updatedusername');
        expect(res.body).toHaveProperty('admin', true);
    });

    test('DELETE /users/:userId - should delete a user by ID', async () => {
        const user = await prisma.user.create({
            data: { username: 'deleteuser', password: 'password', admin: false },
        });

        const res = await request(app)
            .delete(`/users/${user.id}`)
            .set('Authorization', `Bearer ${authToken}`);  // Include the token in the Authorization header
        expect(res.statusCode).toEqual(204);
    });
});
