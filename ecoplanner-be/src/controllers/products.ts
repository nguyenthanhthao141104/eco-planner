import { Router, Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../prisma/client';
import { authMiddleware, adminMiddleware, AuthenticatedRequest } from '../middleware/auth';
import { aiService } from '../services/AIService';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
    try {
        const { tag, search, categoryId, limit = '20', offset = '0' } = req.query;
        const products = await prisma.product.findMany({
            where: {
                isActive: true,
                ...(categoryId && { categoryId: categoryId as string }),
                ...(tag && { tags: { has: tag as string } }),
                ...(search && {
                    AND: (search as string).split(/\s+/).filter(Boolean).map(word => ({
                        OR: [
                            { name: { contains: word, mode: 'insensitive' } },
                            { description: { contains: word, mode: 'insensitive' } },
                            { descriptionAi: { contains: word, mode: 'insensitive' } }
                        ]
                    }))
                }),
            },
            take: parseInt(limit as string),
            skip: parseInt(offset as string),
            orderBy: { createdAt: 'desc' },
            include: { category: true },
        });
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch products' });
    }
});

router.get('/:id', async (req: Request, res: Response) => {
    try {
        const product = await prisma.product.findUnique({ where: { id: req.params.id } });
        if (!product) return res.status(404).json({ error: 'Product not found' });
        res.json(product);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch product' });
    }
});

const createProductSchema = z.object({
    name: z.string().min(2), slug: z.string().min(2), price: z.number().positive(),
    oldPrice: z.number().positive().optional(), description: z.string().optional(),
    image: z.string().url(), images: z.array(z.string().url()).optional(),
    tags: z.array(z.string()).optional(), stock: z.number().int().min(0).optional(),
    categoryId: z.string().optional(),
});

router.post('/', authMiddleware, adminMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const data = createProductSchema.parse(req.body);
        const product = await prisma.product.create({ data: { ...data, images: data.images || [], tags: data.tags || [] } });
        res.status(201).json(product);
    } catch (error) {
        if (error instanceof z.ZodError) return res.status(400).json({ error: error.errors });
        res.status(500).json({ error: 'Failed to create product' });
    }
});

router.patch('/:id', authMiddleware, adminMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const product = await prisma.product.update({ where: { id: req.params.id }, data: req.body });
        res.json(product);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update product' });
    }
});

router.delete('/:id', authMiddleware, adminMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    try {
        await prisma.product.update({ where: { id: req.params.id }, data: { isActive: false } });
        res.json({ message: 'Product deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete product' });
    }
});

router.post('/:id/ai-description', authMiddleware, adminMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const product = await prisma.product.findUnique({ where: { id: req.params.id } });
        if (!product) return res.status(404).json({ error: 'Product not found' });
        const descriptionAi = await aiService.generateProductDescription(product.name, product.tags);
        const updatedProduct = await prisma.product.update({ where: { id: req.params.id }, data: { descriptionAi } });
        res.json(updatedProduct);
    } catch (error) {
        res.status(500).json({ error: 'Failed to generate AI description' });
    }
});

export default router;
