// Set test environment before any imports
process.env.NODE_ENV = 'test';

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// No mocking - use real APIs
beforeAll(async () => {
    // Connect to real database
    await prisma.$connect();
});

afterAll(async () => {
    await prisma.$disconnect();
});

// Export prisma for use in tests
export { prisma };

// Helper to clean test data
export const cleanDatabase = async () => {
    await prisma.message.deleteMany();
    await prisma.conversation.deleteMany();
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    // Don't delete all products/users - just test-created ones
};
