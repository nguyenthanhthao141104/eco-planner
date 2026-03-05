// API Configuration (Force redeploy at 21:18)
let rawBaseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:3001').trim();

// Clean up: remove all protocols and any /api occurrences to start from a clean slate
rawBaseUrl = rawBaseUrl.replace(/^https?:\/\//g, '').replace(/\/api\/?/g, '');

// Reconstruct correctly: Use http for localhost, https for production
const protocol = (rawBaseUrl.includes('localhost') || rawBaseUrl.includes('127.0.0.1')) ? 'http' : 'https';
const API_BASE_URL = `${protocol}://${rawBaseUrl}`;

console.log('📡 API Base URL sanitized:', API_BASE_URL);

interface RequestOptions extends RequestInit {
    skipAuth?: boolean;
}

class ApiClient {
    public readonly baseUrl: string;

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
    }

    private getToken(): string | null {
        return localStorage.getItem('token');
    }

    public async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
        const { skipAuth = false, ...fetchOptions } = options;
        const headers: HeadersInit = { 'Content-Type': 'application/json', ...options.headers };

        if (!skipAuth) {
            const token = this.getToken();
            if (token) (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${this.baseUrl}${endpoint}`, { ...fetchOptions, headers });
        if (!response.ok) {
            const error = await response.json().catch(() => ({ error: 'Request failed' }));
            throw new Error(error.error || `HTTP error ${response.status}`);
        }
        return response.json();
    }

    // Auth
    async login(email: string, password: string) {
        return this.request<{ user: User; token: string }>('/api/auth/login', {
            method: 'POST', body: JSON.stringify({ email, password }), skipAuth: true,
        });
    }

    async register(email: string, password: string, name: string) {
        return this.request<{ user: User; token: string }>('/api/auth/register', {
            method: 'POST', body: JSON.stringify({ email, password, name }), skipAuth: true,
        });
    }

    async getMe() { return this.request<User>('/api/auth/me'); }

    async updateProfile(data: Partial<Pick<User, 'name' | 'phone' | 'address' | 'city' | 'district' | 'ward'>>) {
        return this.request<User>('/api/auth/profile', { method: 'PATCH', body: JSON.stringify(data) });
    }

    async updatePassword(currentPassword: string, newPassword: string) {
        return this.request<{ message: string }>('/api/auth/password', {
            method: 'PATCH',
            body: JSON.stringify({ currentPassword, newPassword }),
        });
    }

    // Products
    async getProducts(params?: { tag?: string; search?: string; categoryId?: string }) {
        const query = new URLSearchParams();
        if (params?.tag) query.set('tag', params.tag);
        if (params?.search) query.set('search', params.search);
        if (params?.categoryId) query.set('categoryId', params.categoryId);
        return this.request<Product[]>(`/api/products${query.toString() ? `?${query}` : ''}`, { skipAuth: true });
    }

    async getProduct(id: string) {
        return this.request<Product>(`/api/products/${id}`, { skipAuth: true });
    }

    async createProduct(data: Omit<Product, 'id'>) {
        return this.request<Product>('/api/products', { method: 'POST', body: JSON.stringify(data) });
    }

    async updateProduct(id: string, data: Partial<Product>) {
        return this.request<Product>(`/api/products/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
    }

    async deleteProduct(id: string) {
        return this.request<{ message: string }>(`/api/products/${id}`, { method: 'DELETE' });
    }

    async generateAIDescription(productId: string) {
        return this.request<Product>(`/api/products/${productId}/ai-description`, { method: 'POST' });
    }

    // Chat
    async sendMessage(message: string) {
        return this.request<{ conversationId: string; message: Message; shouldHandover: boolean }>(
            '/api/chat/send', { method: 'POST', body: JSON.stringify({ message }) }
        );
    }

    async sendFaqMessage(question: string, answer: string) {
        return this.request<{ conversationId: string; message: Message }>(
            '/api/chat/send-faq', { method: 'POST', body: JSON.stringify({ question, answer }) }
        );
    }

    // Public FAQ logging for analytics (no auth required)
    async logFaq(question: string, answer: string, sessionId?: string) {
        return this.request<{ success: boolean }>(
            '/api/chat/log-faq',
            { method: 'POST', body: JSON.stringify({ question, answer, sessionId }), skipAuth: true }
        );
    }

    async getChatHistory(conversationId: string) {
        return this.request<Message[]>(`/api/chat/history/${conversationId}`);
    }

    // Admin
    async getCategories() { return this.request<Category[]>('/api/categories'); }
    async getCategory(id: string) { return this.request<Category>(`/api/categories/${id}`); }
    async createCategory(data: any) { return this.request<Category>('/api/categories', { method: 'POST', body: JSON.stringify(data) }); }
    async updateCategory(id: string, data: any) { return this.request<Category>(`/api/categories/${id}`, { method: 'PATCH', body: JSON.stringify(data) }); }
    async deleteCategory(id: string) { return this.request(`/api/categories/${id}`, { method: 'DELETE' }); }

    async getDashboard() { return this.request<DashboardStats>('/api/admin/dashboard'); }
    async getConversations(preview = false) {
        return this.request<Conversation[]>(`/api/admin/conversations${preview ? '?preview=true' : ''}`);
    }
    async getInventory() { return this.request<InventoryStats>('/api/admin/inventory'); }

    // Admin Orders
    async getOrders() { return this.request<Order[]>('/api/admin/orders'); }
    async updateOrderStatus(orderId: string, status: OrderStatus) {
        return this.request<Order>(`/api/admin/orders/${orderId}/status`, {
            method: 'PATCH', body: JSON.stringify({ status })
        });
    }

    // Admin Customers
    async getCustomers() { return this.request<Customer[]>('/api/admin/customers'); }
    async createCustomer(data: { email: string; password: string; name: string; role?: 'CUSTOMER' | 'ADMIN' }) {
        return this.request<Customer>('/api/admin/customers', { method: 'POST', body: JSON.stringify(data) });
    }
    async toggleCustomerLock(customerId: string) {
        return this.request<Customer>(`/api/admin/customers/${customerId}/lock`, { method: 'PATCH' });
    }

    // User Orders
    async createOrder(data: CreateOrderRequest) {
        return this.request<{ order: UserOrder; paymentMethod: string }>('/api/orders', { method: 'POST', body: JSON.stringify(data) });
    }
    async getUserOrders() {
        return this.request<UserOrder[]>('/api/orders');
    }
    async getUserOrder(id: string) {
        return this.request<UserOrder>(`/api/orders/${id}`);
    }

    // Payment
    async createMomoPayment(orderId: string) {
        return this.request<{ payUrl: string; orderId: string }>('/api/payment/momo', { method: 'POST', body: JSON.stringify({ orderId }) });
    }
    async createVnpayPayment(orderId: string) {
        return this.request<{ payUrl: string; orderId: string }>('/api/payment/vnpay', { method: 'POST', body: JSON.stringify({ orderId }) });
    }
    async confirmCodOrder(orderId: string) {
        return this.request<{ success: boolean; orderId: string }>('/api/payment/cod', { method: 'POST', body: JSON.stringify({ orderId }) });
    }

    // Blogs
    async getBlogs(params?: { type?: string; tag?: string }) {
        const query = new URLSearchParams();
        if (params?.type) query.append('type', params.type);
        if (params?.tag) query.append('tag', params.tag);
        const qs = query.toString();
        return this.request<BlogPost[]>(`/api/blogs${qs ? `?${qs}` : ''}`);
    }

    async getBlogBySlug(slug: string) {
        return this.request<BlogPost & { relatedProducts: Product[] }>(`/api/blogs/${slug}`);
    }

    async uploadFile(file: File) {
        const formData = new FormData();
        formData.append('file', file);

        const token = this.getToken();
        const headers: HeadersInit = {};
        if (token) (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;

        const response = await fetch(`${this.baseUrl}/api/upload`, {
            method: 'POST',
            body: formData,
            headers
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ error: 'Upload failed' }));
            throw new Error(error.error || `HTTP error ${response.status}`);
        }
        return response.json() as Promise<{ url: string }>;
    }

    // Settings
    async getSettings() {
        try {
            const data = await this.request<SystemSettings>('/api/settings', { skipAuth: true });
            return this.mergeWithDefaults(data);
        } catch (error) {
            console.error('Failed to fetch settings, using defaults:', error);
            return DEFAULT_SETTINGS;
        }
    }

    private mergeWithDefaults(data: Partial<SystemSettings>): SystemSettings {
        return {
            ...DEFAULT_SETTINGS,
            ...data,
            branding: { ...DEFAULT_SETTINGS.branding, ...data.branding },
            ai: { ...DEFAULT_SETTINGS.ai, ...data.ai },
            payment: { ...DEFAULT_SETTINGS.payment, ...data.payment },
            seo: { ...DEFAULT_SETTINGS.seo, ...data.seo }
        };
    }

    async updateSettings(data: Partial<SystemSettings>) {
        return this.request<SystemSettings>('/api/settings', { method: 'PATCH', body: JSON.stringify(data) });
    }
}

// Minimal fallback settings - real defaults come from backend
export const DEFAULT_SETTINGS: SystemSettings = {
    branding: {
        facebook: '',
        instagram: '',
        hotline: ''
    },
    ai: {
        greeting: 'Xin chào! Tôi có thể giúp gì cho bạn?'
    },
    payment: {
        bankName: '',
        accountNumber: '',
        accountHolder: '',
        transferContent: 'THANH TOAN {orderId}'
    },
    seo: {
        metaDescription: 'ECO PLANNER - Planner và văn phòng phẩm thân thiện môi trường'
    }
};

// Types
export interface User {
    id: string; email: string; name: string; role: 'CUSTOMER' | 'ADMIN' | 'SUPPORT';
    phone?: string; address?: string; city?: string; district?: string; ward?: string;
    preferences?: Record<string, unknown>;
}

export interface Category {
    id: string; name: string; slug: string; description?: string; image?: string; _count?: { products: number }; createdAt: string;
}

export interface Product {
    id: string; name: string; slug: string; price: number; oldPrice?: number;
    description?: string; descriptionAi?: string; image: string; images: string[]; tags: string[]; stock: number;
    categoryId?: string; category?: Category;
}

export interface Message {
    id: string; conversationId: string; content: string; sender: 'USER' | 'AI' | 'ADMIN'; isInternal: boolean; createdAt: string;
}

export interface Conversation {
    id: string; userId: string; status: 'ACTIVE' | 'RESOLVED' | 'PENDING_HUMAN';
    sentimentScore?: number; summary?: string; tags: string[];
    user?: { name: string; email: string }; messages?: Message[]; createdAt: string; updatedAt: string;
}

export interface DashboardStats {
    todayOrders: number; todayRevenue: number; pendingConversations: number;
    lowStockProducts: { id: string; name: string; stock: number }[]; averageSentiment: number; totalCustomers: number;
}

export interface InventoryStats {
    products: { id: string; name: string; stock: number; price: number }[];
    totalValue: number; lowStockCount: number; outOfStockCount: number;
}

export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

export interface OrderItem {
    id: string; productId: string; quantity: number; price: number;
    product: { id: string; name: string; image: string };
}

export interface Order {
    id: string; userId: string; status: OrderStatus; total: number; note?: string;
    createdAt: string; updatedAt: string;
    user: { id: string; name: string; email: string };
    items: OrderItem[];
}

export interface Customer {
    id: string; email: string; name: string; role: 'CUSTOMER' | 'ADMIN' | 'SUPPORT';
    isLocked: boolean; createdAt: string;
    orderCount: number; totalSpent: number;
}

export interface ShippingAddress {
    name: string; phone: string; address: string; city: string; district?: string; ward?: string;
}

export interface CreateOrderRequest {
    items: { productId: string; quantity: number }[];
    shippingAddress: ShippingAddress;
    note?: string;
    paymentMethod: 'MOMO' | 'VNPAY' | 'COD' | 'BANK';
}

export interface UserOrder {
    id: string; userId: string; status: OrderStatus; total: number; note?: string;
    createdAt: string; updatedAt: string;
    items: OrderItem[];
}

export interface BlogBlock {
    id?: string;
    type: string;
    data: any;
}

export interface EditorJsOutput {
    time: number;
    blocks: BlogBlock[];
    version: string;
}

export interface BlogPost {
    id: string;
    title: string;
    slug: string;
    content: EditorJsOutput;
    excerpt?: string;
    image?: string;
    type: 'ARTICLE' | 'QUOTE' | 'TIP' | 'PODCAST';
    tags: string[];
    relatedProductIds: string[];
    seoKeywords?: Record<string, string>;
    createdAt: string;
}

export interface SystemSettings {
    branding: {
        facebook: string;
        instagram: string;
        hotline: string;
    };
    ai: {
        greeting: string;
    };
    payment: {
        bankName: string;
        accountNumber: string;
        accountHolder: string;
        branch?: string;
        qrCode?: string;
        transferContent: string;
    };
    seo: {
        metaDescription: string;
    };
}

export const api = new ApiClient(API_BASE_URL);
