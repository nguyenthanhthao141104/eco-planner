/**
 * E2E Tests for Real-time Socket.io
 * Using REAL database and AI
 */
import { createServer } from 'http';
import { Server } from 'socket.io';
import { io as ioc, Socket as ClientSocket } from 'socket.io-client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../setup';
import { config } from '../../src/config';
import { setupSocketHandlers } from '../../src/socket/handlers';

jest.setTimeout(60000);

describe('Socket.io E2E', () => {
    let httpServer: ReturnType<typeof createServer>;
    let io: Server;
    let serverPort: number;
    let customerSocket: ClientSocket;
    let adminSocket: ClientSocket;
    let customerToken: string;
    let adminToken: string;
    const testTimestamp = Date.now();
    const customerEmail = `customer_e2e_${testTimestamp}@test.com`;
    const adminEmail = `admin_e2e_${testTimestamp}@test.com`;

    beforeAll(async () => {
        // Create test HTTP server with Socket.io on random port
        httpServer = createServer();
        io = new Server(httpServer, { cors: { origin: '*' } });
        setupSocketHandlers(io);

        await new Promise<void>((resolve) => {
            httpServer.listen(0, () => {
                const address = httpServer.address();
                serverPort = typeof address === 'object' ? address!.port : 0;
                resolve();
            });
        });

        // Create test users with unique emails
        const hashedPassword = await bcrypt.hash('test123', 10);

        const customer = await prisma.user.create({
            data: { email: customerEmail, password: hashedPassword, name: 'E2E Customer', role: 'CUSTOMER' },
        });
        customerToken = jwt.sign({ userId: customer.id, email: customer.email, role: customer.role }, config.jwt.secret);

        const admin = await prisma.user.create({
            data: { email: adminEmail, password: hashedPassword, name: 'E2E Admin', role: 'ADMIN' },
        });
        adminToken = jwt.sign({ userId: admin.id, email: admin.email, role: admin.role }, config.jwt.secret);
    });

    afterAll(async () => {
        // Cleanup test users
        await prisma.message.deleteMany({ where: { conversation: { user: { email: { in: [customerEmail, adminEmail] } } } } });
        await prisma.conversation.deleteMany({ where: { user: { email: { in: [customerEmail, adminEmail] } } } });
        await prisma.user.deleteMany({ where: { email: { in: [customerEmail, adminEmail] } } });
        io.close();
        httpServer.close();
    });

    afterEach(() => {
        if (customerSocket) customerSocket.close();
        if (adminSocket) adminSocket.close();
    });

    it('should allow admin to join admin-room and receive visitor_count', (done) => {
        adminSocket = ioc(`http://localhost:${serverPort}`, { auth: { token: adminToken } });
        adminSocket.on('visitor_count', (data) => {
            expect(data.count).toBeGreaterThanOrEqual(1);
            done();
        });
    });

    it('should broadcast update_dashboard to admin when customer sends message', (done) => {
        adminSocket = ioc(`http://localhost:${serverPort}`, { auth: { token: adminToken } });

        adminSocket.on('connect', () => {
            customerSocket = ioc(`http://localhost:${serverPort}`, { auth: { token: customerToken } });
            customerSocket.on('connect', () => {
                setTimeout(() => customerSocket.emit('send_message', { message: 'Hello' }), 100);
            });
        });

        adminSocket.on('update_dashboard', (data) => {
            expect(data.type).toBe('new_message');
            done();
        });
    });

    it('should emit handover_request to admin-room when sentiment is low', (done) => {
        adminSocket = ioc(`http://localhost:${serverPort}`, { auth: { token: adminToken } });

        adminSocket.on('connect', () => {
            customerSocket = ioc(`http://localhost:${serverPort}`, { auth: { token: customerToken } });
            customerSocket.on('connect', () => {
                setTimeout(() => {
                    customerSocket.emit('send_message', { message: 'Tôi rất thất vọng và không hài lòng!' });
                }, 100);
            });
        });

        adminSocket.on('handover_request', (data) => {
            expect(data.conversationId).toBeDefined();
            done();
        });
    }, 30000);
});
