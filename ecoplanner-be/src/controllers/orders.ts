import { Router, Response } from 'express';
import prisma from '../prisma/client';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth';
import { z } from 'zod';

const router = Router();

// Create order schema
const createOrderSchema = z.object({
    items: z.array(z.object({
        productId: z.string(),
        quantity: z.number().int().positive(),
    })),
    shippingAddress: z.object({
        name: z.string(),
        phone: z.string(),
        address: z.string(),
        city: z.string(),
        district: z.string().optional(),
        ward: z.string().optional(),
    }),
    note: z.string().optional(),
    paymentMethod: z.enum(['MOMO', 'VNPAY', 'COD', 'BANK']),
});

// POST /api/orders - Create new order
router.post('/', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const data = createOrderSchema.parse(req.body);

        // Get product prices
        const productIds = data.items.map(item => item.productId);
        const products = await prisma.product.findMany({
            where: { id: { in: productIds } },
            select: { id: true, price: true, stock: true, name: true },
        });

        // Validate products and stock
        const productMap = new Map(products.map(p => [p.id, p]));
        let total = 0;
        const orderItems: { productId: string; quantity: number; price: number }[] = [];

        for (const item of data.items) {
            const product = productMap.get(item.productId);
            if (!product) {
                return res.status(400).json({ error: `Product ${item.productId} not found` });
            }
            if (product.stock < item.quantity) {
                return res.status(400).json({ error: `Insufficient stock for ${product.name}` });
            }
            total += product.price * item.quantity;
            orderItems.push({ productId: item.productId, quantity: item.quantity, price: product.price });
        }

        // Calculate shipping and discount
        const shippingFee = total >= 500000 ? 0 : 30000;
        const discount = shippingFee > 0 ? 15000 : 30000;
        const finalTotal = total + shippingFee - discount;

        // Create order
        const order = await prisma.order.create({
            data: {
                userId: req.user!.userId,
                total: finalTotal,
                status: data.paymentMethod === 'COD' ? 'PENDING' : 'PENDING',
                note: data.note,
                items: {
                    create: orderItems,
                },
            },
            include: {
                items: { include: { product: { select: { id: true, name: true, image: true } } } },
            },
        });

        // Update stock
        for (const item of data.items) {
            await prisma.product.update({
                where: { id: item.productId },
                data: { stock: { decrement: item.quantity } },
            });
        }

        res.status(201).json({
            order,
            shippingAddress: data.shippingAddress,
            paymentMethod: data.paymentMethod,
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: error.errors });
        }
        console.error('Create order error:', error);
        res.status(500).json({ error: 'Failed to create order' });
    }
});

// GET /api/orders - Get user's orders
router.get('/', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const orders = await prisma.order.findMany({
            where: { userId: req.user!.userId },
            include: {
                items: { include: { product: { select: { id: true, name: true, image: true } } } },
            },
            orderBy: { createdAt: 'desc' },
        });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
});

// GET /api/orders/:id - Get order details
router.get('/:id', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const order = await prisma.order.findFirst({
            where: { id: req.params.id, userId: req.user!.userId },
            include: {
                items: { include: { product: true } },
            },
        });
        if (!order) return res.status(404).json({ error: 'Order not found' });
        res.json(order);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch order' });
    }
});

export default router;
