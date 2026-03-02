import { Router, Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../prisma/client';
import { adminMiddleware, authMiddleware } from '../middleware/auth';

const router = Router();

const createCategorySchema = z.object({
    name: z.string().min(2),
    slug: z.string().min(2),
    description: z.string().optional(),
    image: z.string().optional(),
});

const updateCategorySchema = z.object({
    name: z.string().min(2).optional(),
    slug: z.string().min(2).optional(),
    description: z.string().optional(),
    image: z.string().nullable().optional(),
});

// Get all categories
router.get('/', async (req: Request, res: Response) => {
    try {
        const categories = await prisma.category.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                _count: {
                    select: { products: true }
                }
            }
        });
        res.json(categories);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch categories' });
    }
});

// Get single category
router.get('/:id', async (req: Request, res: Response) => {
    try {
        const category = await prisma.category.findUnique({
            where: { id: req.params.id },
            include: { products: true }
        });
        if (!category) return res.status(404).json({ error: 'Category not found' });
        res.json(category);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch category' });
    }
});

// Create category (Admin only)
router.post('/', authMiddleware, adminMiddleware, async (req: Request, res: Response) => {
    try {
        const data = createCategorySchema.parse(req.body);

        // Check if slug exists
        const existing = await prisma.category.findUnique({ where: { slug: data.slug } });
        if (existing) return res.status(400).json({ error: 'Slug already exists' });

        const category = await prisma.category.create({ data });
        res.status(201).json(category);
    } catch (error) {
        if (error instanceof z.ZodError) return res.status(400).json({ error: error.errors });
        res.status(500).json({ error: 'Failed to create category' });
    }
});

// Update category (Admin only)
router.patch('/:id', authMiddleware, adminMiddleware, async (req: Request, res: Response) => {
    try {
        const data = updateCategorySchema.parse(req.body);

        if (data.slug) {
            const existing = await prisma.category.findUnique({ where: { slug: data.slug } });
            if (existing && existing.id !== req.params.id) {
                return res.status(400).json({ error: 'Slug already exists' });
            }
        }

        const category = await prisma.category.update({
            where: { id: req.params.id },
            data
        });
        res.json(category);
    } catch (error) {
        if (error instanceof z.ZodError) return res.status(400).json({ error: error.errors });
        res.status(500).json({ error: 'Failed to update category' });
    }
});

// Delete category (Admin only)
router.delete('/:id', authMiddleware, adminMiddleware, async (req: Request, res: Response) => {
    try {
        // Check if products exist
        const productsCount = await prisma.product.count({ where: { categoryId: req.params.id } });
        if (productsCount > 0) {
            return res.status(400).json({ error: 'Cannot delete category with associated products' });
        }

        await prisma.category.delete({ where: { id: req.params.id } });
        res.json({ message: 'Category deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete category' });
    }
});

export default router;
