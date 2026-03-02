/**
 * Integration Tests for Chat API
 * Using REAL database and AI
 */
import request from 'supertest';
import { app } from '../../src/index';
import { prisma } from '../setup';
import bcrypt from 'bcryptjs';

jest.setTimeout(60000); // Longer timeout for AI calls

describe('Chat API Integration', () => {
    let authToken: string;
    let testUserId: string;
    const testEmail = `chat_test_${Date.now()}@test.com`;

    beforeAll(async () => {
        // Create test user
        const hashedPassword = await bcrypt.hash('test123', 10);
        const user = await prisma.user.create({
            data: {
                email: testEmail,
                password: hashedPassword,
                name: 'Chat Test User',
                role: 'CUSTOMER',
            },
        });
        testUserId = user.id;

        // Get auth token
        const loginRes = await request(app)
            .post('/api/auth/login')
            .send({ email: testEmail, password: 'test123' });

        authToken = loginRes.body.token;
    });

    afterAll(async () => {
        // Cleanup
        await prisma.message.deleteMany({ where: { conversation: { userId: testUserId } } });
        await prisma.conversation.deleteMany({ where: { userId: testUserId } });
        await prisma.user.delete({ where: { id: testUserId } });
    });

    describe('POST /api/chat/send', () => {
        it('should create conversation and return AI response', async () => {
            const res = await request(app)
                .post('/api/chat/send')
                .set('Authorization', `Bearer ${authToken}`)
                .send({ message: 'Xin chào, tôi muốn mua sổ tay eco' });

            expect(res.status).toBe(200);
            expect(res.body.conversationId).toBeDefined();
            expect(res.body.message).toBeDefined();
            expect(res.body.message.sender).toBe('AI');
            console.log('AI Response:', res.body.message.content);
        });

        it('should return 401 without auth token', async () => {
            const res = await request(app)
                .post('/api/chat/send')
                .send({ message: 'Test' });

            expect(res.status).toBe(401);
        });

        it('should return 400 without message body', async () => {
            const res = await request(app)
                .post('/api/chat/send')
                .set('Authorization', `Bearer ${authToken}`)
                .send({});

            expect(res.status).toBe(400);
        });
    });

    describe('GET /api/chat/history/:conversationId', () => {
        it('should return conversation history', async () => {
            // Create a conversation first
            const sendRes = await request(app)
                .post('/api/chat/send')
                .set('Authorization', `Bearer ${authToken}`)
                .send({ message: 'Bạn có những sản phẩm nào?' });

            const conversationId = sendRes.body.conversationId;

            // Get history
            const historyRes = await request(app)
                .get(`/api/chat/history/${conversationId}`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(historyRes.status).toBe(200);
            expect(historyRes.body.length).toBeGreaterThanOrEqual(2);
        });
    });
});
