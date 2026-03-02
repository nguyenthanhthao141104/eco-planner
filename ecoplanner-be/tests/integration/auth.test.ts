/**
 * Integration Tests for Auth API
 * Using REAL database
 */
import request from 'supertest';
import { app } from '../../src/index';
import { prisma, cleanDatabase } from '../setup';

jest.setTimeout(30000);

describe('Auth API Integration', () => {
    const testEmail = `test_${Date.now()}@test.com`;

    afterAll(async () => {
        // Cleanup test user
        await prisma.user.deleteMany({ where: { email: testEmail } });
    });

    describe('POST /api/auth/register', () => {
        it('should register a new user', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    email: testEmail,
                    password: 'password123',
                    name: 'Test User',
                });

            expect(res.status).toBe(201);
            expect(res.body.user.email).toBe(testEmail);
            expect(res.body.token).toBeDefined();
        });

        it('should reject duplicate email', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    email: testEmail,
                    password: 'password123',
                    name: 'Duplicate User',
                });

            expect(res.status).toBe(400);
        });

        it('should reject invalid email', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    email: 'invalid-email',
                    password: 'password123',
                    name: 'Test User',
                });

            expect(res.status).toBe(400);
        });
    });

    describe('POST /api/auth/login', () => {
        it('should login with valid credentials', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: testEmail,
                    password: 'password123',
                });

            expect(res.status).toBe(200);
            expect(res.body.token).toBeDefined();
        });

        it('should reject invalid password', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: testEmail,
                    password: 'wrongpassword',
                });

            expect(res.status).toBe(401);
        });
    });

    describe('GET /api/auth/me', () => {
        let authToken: string;

        beforeAll(async () => {
            const loginRes = await request(app)
                .post('/api/auth/login')
                .send({ email: testEmail, password: 'password123' });
            authToken = loginRes.body.token;
        });

        it('should return current user with valid token', async () => {
            const res = await request(app)
                .get('/api/auth/me')
                .set('Authorization', `Bearer ${authToken}`);

            expect(res.status).toBe(200);
            expect(res.body.email).toBe(testEmail);
        });

        it('should reject without token', async () => {
            const res = await request(app).get('/api/auth/me');
            expect(res.status).toBe(401);
        });
    });
});
