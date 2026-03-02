import { Router, Response } from 'express';
import { authMiddleware, adminMiddleware, AuthenticatedRequest } from '../middleware/auth';
import { chatService } from '../services/ChatService';

const router = Router();

router.post('/send', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { message } = req.body;
        if (!message) return res.status(400).json({ error: 'Message is required' });
        const conversation = await chatService.getOrCreateConversation(req.user!.userId);
        await chatService.sendMessage(conversation.id, message, 'USER');
        const { message: aiMessage, shouldHandover } = await chatService.getAIResponse(conversation.id);
        res.json({ conversationId: conversation.id, message: aiMessage, shouldHandover });
    } catch (error) {
        res.status(500).json({ error: 'Failed to process message' });
    }
});

// FAQ endpoint - saves both question and pre-defined answer
router.post('/send-faq', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { question, answer } = req.body;
        if (!question || !answer) return res.status(400).json({ error: 'Question and answer are required' });
        const conversation = await chatService.getOrCreateConversation(req.user!.userId);
        await chatService.sendMessage(conversation.id, question, 'USER');
        const faqMessage = await chatService.sendMessage(conversation.id, answer, 'AI');
        res.json({ conversationId: conversation.id, message: faqMessage });
    } catch (error) {
        res.status(500).json({ error: 'Failed to save FAQ' });
    }
});

// Public FAQ logging - for analytics (no auth required)
router.post('/log-faq', async (req: any, res: Response) => {
    try {
        const { question, answer, sessionId } = req.body;
        if (!question || !answer) return res.status(400).json({ error: 'Question and answer are required' });

        // Get userId if authenticated (optional)
        const authHeader = req.headers.authorization;
        let userId = null;
        if (authHeader) {
            try {
                const jwt = require('jsonwebtoken');
                const token = authHeader.split(' ')[1];
                const decoded = jwt.verify(token, process.env.JWT_SECRET) as any;
                userId = decoded.userId;
            } catch { }
        }

        // Use shared prisma instance from chatService
        const { PrismaClient } = require('@prisma/client');
        const prisma = (chatService as any).prisma || new PrismaClient();

        // Try to log FAQ, but don't crash if table doesn't exist yet
        try {
            await prisma.faqLog.create({
                data: {
                    question,
                    answer,
                    userId,
                    sessionId,
                    userAgent: req.headers['user-agent']
                }
            });
        } catch (dbError: any) {
            // Table might not exist yet - log but don't fail
            console.warn('FaqLog table may not exist yet:', dbError.message);
        }

        res.json({ success: true });
    } catch (error) {
        console.error('Failed to log FAQ:', error);
        res.json({ success: true }); // Don't fail the request, just log the error
    }
});

router.get('/history/:conversationId', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const messages = await chatService.getConversationHistory(req.params.conversationId);
        res.json(messages);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch history' });
    }
});

router.get('/conversations', authMiddleware, adminMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const conversations = await chatService.getActiveConversations();
        res.json(conversations);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch conversations' });
    }
});

router.get('/attention', authMiddleware, adminMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const conversations = await chatService.getConversationsNeedingAttention();
        res.json(conversations);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch conversations' });
    }
});

router.post('/:conversationId/assign', authMiddleware, adminMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const conversation = await chatService.assignConversation(req.params.conversationId, req.user!.userId);
        res.json(conversation);
    } catch (error) {
        res.status(500).json({ error: 'Failed to assign conversation' });
    }
});

router.post('/:conversationId/resolve', authMiddleware, adminMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const conversation = await chatService.resolveConversation(req.params.conversationId, req.user!.userId);
        res.json(conversation);
    } catch (error) {
        res.status(500).json({ error: 'Failed to resolve conversation' });
    }
});

router.post('/:conversationId/admin-message', authMiddleware, adminMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { message } = req.body;
        if (!message) return res.status(400).json({ error: 'Message is required' });
        const savedMessage = await chatService.sendMessage(req.params.conversationId, message, 'ADMIN');
        res.json(savedMessage);
    } catch (error) {
        res.status(500).json({ error: 'Failed to send message' });
    }
});

export default router;
