import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { JwtPayload } from '../middleware/auth';
import { chatService } from '../services/ChatService';

interface AuthenticatedSocket extends Socket { user?: JwtPayload; }
let visitorCount = 0;

export const setupSocketHandlers = (io: Server) => {
    io.use((socket: AuthenticatedSocket, next) => {
        const token = socket.handshake.auth.token;
        if (token) {
            try {
                socket.user = jwt.verify(token, config.jwt.secret) as JwtPayload;
            } catch (error) { /* continue as guest */ }
        }
        next();
    });

    io.on('connection', (socket: AuthenticatedSocket) => {
        visitorCount++;
        console.log(`[Socket] Connected: ${socket.id} (total: ${visitorCount})`);
        if (socket.user) {
            socket.join(`user:${socket.user.userId}`);
            if (socket.user.role === 'ADMIN' || socket.user.role === 'SUPPORT') {
                socket.join('admin-room');
            }
        }
        io.to('admin-room').emit('visitor_count', { count: visitorCount });

        socket.on('send_message', async (data: { message: string }) => {
            if (!socket.user) return socket.emit('error', { message: 'Auth required' });
            try {
                const conversation = await chatService.getOrCreateConversation(socket.user.userId);
                const userMessage = await chatService.sendMessage(conversation.id, data.message, 'USER');
                socket.emit('message_received', { conversationId: conversation.id, message: userMessage });
                const { message: aiMessage, shouldHandover } = await chatService.getAIResponse(conversation.id);
                socket.emit('ai_response', { conversationId: conversation.id, message: aiMessage, shouldHandover });
                if (shouldHandover) {
                    io.to('admin-room').emit('handover_request', { conversationId: conversation.id, userId: socket.user.userId });
                }
                io.to('admin-room').emit('update_dashboard', { type: 'new_message' });
            } catch (error) {
                socket.emit('error', { message: 'Failed to process message' });
            }
        });

        socket.on('admin_message', async (data: { conversationId: string; message: string }) => {
            if (!socket.user || (socket.user.role !== 'ADMIN' && socket.user.role !== 'SUPPORT')) return;
            try {
                const message = await chatService.sendMessage(data.conversationId, data.message, 'ADMIN');
                io.to('admin-room').emit('admin_message_sent', { conversationId: data.conversationId, message });
            } catch (error) {
                socket.emit('error', { message: 'Failed to send message' });
            }
        });

        socket.on('disconnect', () => {
            visitorCount = Math.max(0, visitorCount - 1);
            io.to('admin-room').emit('visitor_count', { count: visitorCount });
        });
    });
};
