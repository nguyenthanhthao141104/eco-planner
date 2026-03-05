import { useState, useCallback, useEffect, useRef } from 'react';
import { api, Message } from '../services/api';
import { socketService } from '../services/socket';
import { useAuth } from '../contexts/AuthContext';

interface ChatMessage {
    id: string; content: string; sender: 'USER' | 'AI' | 'ADMIN'; createdAt: string;
}

export function useChat() {
    const { isAuthenticated, token } = useAuth();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [conversationId, setConversationId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const initializedRef = useRef(false);

    useEffect(() => {
        if (isAuthenticated && token && !initializedRef.current) {
            socketService.connect(token);
            initializedRef.current = true;
        }
    }, [isAuthenticated, token]);

    useEffect(() => {
        const unsubMessage = socketService.on<{ conversationId: string; message: Message }>(
            'message_received', (data) => { setConversationId(data.conversationId); setMessages(prev => [...prev, data.message]); }
        );
        const unsubAI = socketService.on<{ conversationId: string; message: Message }>(
            'ai_response', (data) => { setIsTyping(false); setMessages(prev => [...prev, data.message]); }
        );
        const unsubError = socketService.on<{ message: string }>('error', (data) => { setError(data.message); setIsTyping(false); });

        return () => { unsubMessage(); unsubAI(); unsubError(); };
    }, []);

    const sendMessage = useCallback(async (content: string) => {
        if (!content.trim()) return;
        setError(null);

        if (!socketService.isConnected()) {
            setIsLoading(true);
            try {
                const response = await api.sendMessage(content);
                setConversationId(response.conversationId);
                setMessages(prev => [...prev, { id: Date.now().toString(), content, sender: 'USER', createdAt: new Date().toISOString() }, response.message]);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to send message');
            } finally {
                setIsLoading(false);
            }
            return;
        }

        setIsTyping(true);
        socketService.sendMessage(content, conversationId || undefined);
    }, [conversationId]);

    const loadHistory = useCallback(async (convId: string) => {
        if (!convId) return;
        setIsLoading(true);
        try {
            const history = await api.getChatHistory(convId);
            setMessages(history);
            setConversationId(convId);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load history');
        } finally {
            setIsLoading(false);
        }
    }, []);

    const clearChat = useCallback(() => { setMessages([]); setConversationId(null); setError(null); }, []);

    return { messages, conversationId, isLoading, isTyping, error, sendMessage, loadHistory, clearChat };
}
