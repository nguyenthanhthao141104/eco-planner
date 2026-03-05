import { io, Socket } from 'socket.io-client';

let rawSocketUrl = (import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL || 'http://localhost:3001').trim();
// Clean up URL: remove protocols and trailing slashes
rawSocketUrl = rawSocketUrl.replace(/^https?:\/\//g, '').replace(/\/api\/?/g, '').replace(/\/$/, '');
// Reconstruct correctly: Use http for localhost, https for production
const protocol = (rawSocketUrl.includes('localhost') || rawSocketUrl.includes('127.0.0.1')) ? 'http' : 'https';
const SOCKET_URL = `${protocol}://${rawSocketUrl}`;

console.log('🔌 Socket URL sanitized:', SOCKET_URL);

class SocketService {
    private socket: Socket | null = null;
    private listeners: Map<string, Set<(data: unknown) => void>> = new Map();

    connect(token?: string) {
        if (this.socket?.connected) return;

        this.socket = io(SOCKET_URL, {
            auth: token ? { token } : undefined,
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });

        this.socket.on('connect', () => console.log('[Socket] Connected:', this.socket?.id));
        this.socket.on('disconnect', (reason) => console.log('[Socket] Disconnected:', reason));

        // Re-attach listeners
        this.listeners.forEach((callbacks, event) => {
            callbacks.forEach((cb) => this.socket?.on(event, cb));
        });
    }

    disconnect() {
        this.socket?.disconnect();
        this.socket = null;
    }

    on<T = unknown>(event: string, callback: (data: T) => void) {
        if (!this.listeners.has(event)) this.listeners.set(event, new Set());
        this.listeners.get(event)!.add(callback as (data: unknown) => void);
        this.socket?.on(event, callback);
        return () => { this.listeners.get(event)?.delete(callback as (data: unknown) => void); this.socket?.off(event, callback); };
    }

    emit<T = unknown>(event: string, data?: T) {
        this.socket?.emit(event, data);
    }

    // Chat methods
    sendMessage(message: string, conversationId?: string) {
        this.emit('send_message', { message, conversationId });
    }

    // Admin methods
    sendAdminMessage(conversationId: string, message: string, isInternal = false) {
        this.emit('admin_message', { conversationId, message, isInternal });
    }

    isConnected(): boolean { return this.socket?.connected ?? false; }
}

export const socketService = new SocketService();
