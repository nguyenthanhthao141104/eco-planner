import prisma from '../prisma/client';
import { Conversation, Message, MessageSender } from '@prisma/client';
import { aiService } from './AIService';

interface ChatMessage { role: 'user' | 'assistant' | 'system'; content: string; }

export class ChatService {
    async getOrCreateConversation(userId: string): Promise<Conversation> {
        let conversation = await prisma.conversation.findFirst({
            where: { userId, status: 'ACTIVE' },
            orderBy: { createdAt: 'desc' },
        });
        if (!conversation) {
            conversation = await prisma.conversation.create({ data: { userId } });
        }
        return conversation;
    }

    async sendMessage(conversationId: string, content: string, sender: MessageSender = 'USER'): Promise<Message> {
        return prisma.message.create({ data: { conversationId, content, sender } });
    }

    async getAIResponse(conversationId: string): Promise<{ message: Message; shouldHandover: boolean }> {
        const messages = await prisma.message.findMany({
            where: { conversationId },
            orderBy: { createdAt: 'asc' },
            take: 20,
        });
        const chatHistory: ChatMessage[] = messages.map(m => ({
            role: m.sender === 'USER' ? 'user' : 'assistant',
            content: m.content,
        }));
        const aiResponse = await aiService.generateReply(chatHistory);
        const aiMessage = await prisma.message.create({
            data: { conversationId, content: aiResponse.content, sender: 'AI' },
        });
        if (aiResponse.sentiment) {
            await prisma.conversation.update({
                where: { id: conversationId },
                data: { sentimentScore: aiResponse.sentiment, status: aiResponse.sentiment <= 2 ? 'PENDING_HUMAN' : 'ACTIVE' },
            });
        }
        return { message: aiMessage, shouldHandover: (aiResponse.sentiment ?? 3) <= 2 };
    }

    async getConversationHistory(conversationId: string): Promise<Message[]> {
        return prisma.message.findMany({ where: { conversationId }, orderBy: { createdAt: 'asc' } });
    }

    async resolveConversation(conversationId: string, adminId: string): Promise<Conversation> {
        return prisma.conversation.update({ where: { id: conversationId }, data: { status: 'RESOLVED', assignedTo: adminId } });
    }

    async assignConversation(conversationId: string, adminId: string): Promise<Conversation> {
        return prisma.conversation.update({ where: { id: conversationId }, data: { assignedTo: adminId, status: 'ACTIVE' } });
    }

    async getActiveConversations(): Promise<Conversation[]> {
        return prisma.conversation.findMany({
            where: { status: { in: ['ACTIVE', 'PENDING_HUMAN'] } },
            include: { user: { select: { name: true, email: true } }, messages: { orderBy: { createdAt: 'desc' }, take: 1 } },
            orderBy: { updatedAt: 'desc' },
        });
    }

    async getConversationsNeedingAttention(): Promise<Conversation[]> {
        return prisma.conversation.findMany({
            where: { OR: [{ status: 'PENDING_HUMAN' }, { sentimentScore: { lte: 2 } }] },
            include: { user: { select: { name: true, email: true } }, messages: { orderBy: { createdAt: 'desc' }, take: 1 } },
            orderBy: { sentimentScore: 'asc' },
        });
    }
}

export const chatService = new ChatService();
