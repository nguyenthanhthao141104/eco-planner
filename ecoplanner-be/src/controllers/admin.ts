import { Router, Response } from 'express';
import { authMiddleware, adminMiddleware, AuthenticatedRequest } from '../middleware/auth';
import prisma from '../prisma/client';
import bcrypt from 'bcryptjs';

const router = Router();

// Order status flow: PENDING -> CONFIRMED -> SHIPPED -> DELIVERED (or CANCELLED at any step except DELIVERED)
const ORDER_STATUS_FLOW: Record<string, string[]> = {
    PENDING: ['CONFIRMED', 'CANCELLED'],
    CONFIRMED: ['SHIPPED', 'CANCELLED'],
    SHIPPED: ['DELIVERED', 'CANCELLED'],
    DELIVERED: [],
    CANCELLED: [],
};

// GET /api/admin/dashboard - Dashboard stats
router.get('/dashboard', authMiddleware, adminMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const [todayOrders, todayRevenue, pendingConversations, lowStockProducts, sentimentAverage, totalCustomers] = await Promise.all([
            prisma.order.count({ where: { createdAt: { gte: today } } }),
            prisma.order.aggregate({ where: { createdAt: { gte: today } }, _sum: { total: true } }),
            prisma.conversation.count({ where: { OR: [{ status: 'PENDING_HUMAN' }, { sentimentScore: { lte: 2 } }] } }),
            prisma.product.findMany({ where: { isActive: true, stock: { lte: 20 } }, select: { id: true, name: true, stock: true }, orderBy: { stock: 'asc' }, take: 5 }),
            prisma.conversation.aggregate({ _avg: { sentimentScore: true } }),
            prisma.user.count({ where: { role: 'CUSTOMER' } }),
        ]);
        res.json({ todayOrders, todayRevenue: todayRevenue._sum.total || 0, pendingConversations, lowStockProducts, averageSentiment: sentimentAverage._avg.sentimentScore || 3, totalCustomers });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch dashboard stats' });
    }
});

// GET /api/admin/conversations - All conversations
router.get('/conversations', authMiddleware, adminMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { preview } = req.query;
        const conversations = await prisma.conversation.findMany({
            include: {
                user: { select: { id: true, name: true, email: true } },
                messages: {
                    orderBy: { createdAt: preview === 'true' ? 'desc' : 'asc' },
                    ...(preview === 'true' ? { take: 1 } : {})
                },
            },
            orderBy: { updatedAt: 'desc' },
        });
        res.json(conversations);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch conversations' });
    }
});

// GET /api/admin/inventory - Inventory status
router.get('/inventory', authMiddleware, adminMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const products = await prisma.product.findMany({ where: { isActive: true }, select: { id: true, name: true, stock: true, price: true }, orderBy: { stock: 'asc' } });
        const totalValue = products.reduce((sum, p) => sum + (p.stock * p.price), 0);
        res.json({ products, totalValue, lowStockCount: products.filter(p => p.stock <= 20).length, outOfStockCount: products.filter(p => p.stock === 0).length });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch inventory' });
    }
});

// ============== ORDERS API ==============

// GET /api/admin/orders - List all orders
router.get('/orders', authMiddleware, adminMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const orders = await prisma.order.findMany({
            include: {
                user: { select: { id: true, name: true, email: true } },
                items: { include: { product: { select: { id: true, name: true, image: true } } } },
            },
            orderBy: { createdAt: 'desc' },
        });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
});

// PATCH /api/admin/orders/:id/status - Update order status (with flow validation)
router.patch('/orders/:id/status', authMiddleware, adminMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const order = await prisma.order.findUnique({ where: { id } });
        if (!order) return res.status(404).json({ error: 'Order not found' });

        const allowedStatuses = ORDER_STATUS_FLOW[order.status];
        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                error: `Cannot change status from ${order.status} to ${status}. Allowed: ${allowedStatuses.join(', ') || 'none'}`
            });
        }

        const updated = await prisma.order.update({ where: { id }, data: { status } });
        res.json(updated);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update order status' });
    }
});

// ============== CUSTOMERS API ==============

// GET /api/admin/customers - List all users
router.get('/customers', authMiddleware, adminMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true, email: true, name: true, role: true, isLocked: true, createdAt: true,
                _count: { select: { orders: true } },
            },
            orderBy: { createdAt: 'desc' },
        });

        // Get total spent per user
        const userSpent = await prisma.order.groupBy({
            by: ['userId'],
            _sum: { total: true },
        });
        const spentMap = new Map(userSpent.map(u => [u.userId, u._sum.total || 0]));

        const usersWithStats = users.map(u => ({
            ...u,
            orderCount: u._count.orders,
            totalSpent: spentMap.get(u.id) || 0,
        }));

        res.json(usersWithStats);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch customers' });
    }
});

// POST /api/admin/customers - Create new user (admin can create user or admin)
router.post('/customers', authMiddleware, adminMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { email, password, name, role = 'CUSTOMER' } = req.body;

        if (!email || !password || !name) {
            return res.status(400).json({ error: 'Email, password, and name are required' });
        }

        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) return res.status(400).json({ error: 'Email already exists' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: { email, password: hashedPassword, name, role },
            select: { id: true, email: true, name: true, role: true, isLocked: true, createdAt: true },
        });

        res.status(201).json(user);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create user' });
    }
});

// PATCH /api/admin/customers/:id/lock - Toggle user lock status
router.patch('/customers/:id/lock', authMiddleware, adminMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { id } = req.params;

        const user = await prisma.user.findUnique({ where: { id } });
        if (!user) return res.status(404).json({ error: 'User not found' });

        // Prevent locking own account
        if (user.id === req.user?.userId) {
            return res.status(400).json({ error: 'Cannot lock your own account' });
        }

        const updated = await prisma.user.update({
            where: { id },
            data: { isLocked: !user.isLocked },
            select: { id: true, email: true, name: true, role: true, isLocked: true },
        });

        res.json(updated);
    } catch (error) {
        res.status(500).json({ error: 'Failed to toggle user lock status' });
    }
});

export default router;
