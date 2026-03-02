import { Router, Request, Response } from 'express';
import prisma from '../prisma/client';

const router = Router();

// Get all blog posts
router.get('/', async (req: Request, res: Response) => {
    try {
        const { type, tag } = req.query;

        const posts = await prisma.blogPost.findMany({
            where: {
                ...(type && { type: type as any }),
                ...(tag && { tags: { has: tag as string } }),
            },
            orderBy: { createdAt: 'desc' },
        });

        res.json(posts);
    } catch (error) {
        console.error('Error fetching blogs:', error);
        res.status(500).json({ error: 'Failed to fetch blog posts', details: (error as Error).message });
    }
});
// Get single blog post by slug (public)
router.get('/:slug', async (req: Request, res: Response) => {
    try {
        const { slug } = req.params;
        const post = await prisma.blogPost.findUnique({
            where: { slug },
        });

        if (!post) {
            return res.status(404).json({ error: 'Blog post not found' });
        }

        // Fetch related products if any
        let relatedProducts: any[] = [];
        if (post.relatedProductIds && post.relatedProductIds.length > 0) {
            relatedProducts = await prisma.product.findMany({
                where: { id: { in: post.relatedProductIds } },
            });
        }

        res.json({ ...post, relatedProducts });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch blog post' });
    }
});

// Get single blog post by ID (for admin editing)
router.get('/id/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const post = await prisma.blogPost.findUnique({
            where: { id },
        });
        if (!post) return res.status(404).json({ error: 'Blog post not found' });
        res.json(post);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch blog post' });
    }
});

// Create blog post
router.post('/', async (req: Request, res: Response) => {
    try {
        const { title, slug, content, excerpt, image, type, tags, relatedProductIds, seoKeywords } = req.body;
        const post = await prisma.blogPost.create({
            data: { title, slug, content, excerpt, image, type, tags, relatedProductIds, seoKeywords },
        });
        res.status(201).json(post);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create blog post' });
    }
});

// Update blog post
router.patch('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { title, slug, content, excerpt, image, type, tags, relatedProductIds, seoKeywords } = req.body;
        const post = await prisma.blogPost.update({
            where: { id },
            data: { title, slug, content, excerpt, image, type, tags, relatedProductIds, seoKeywords },
        });
        res.json(post);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update blog post' });
    }
});

// Delete blog post
router.delete('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await prisma.blogPost.delete({ where: { id } });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete blog post' });
    }
});

export default router;
