import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Package, Calendar, CreditCard, Loader2, ShoppingBag, ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { api, UserOrder, OrderStatus } from '../services/api';

const Orders: React.FC = () => {
    const navigate = useNavigate();
    const { user, isLoading: authLoading, isAuthenticated } = useAuth();
    const [orders, setOrders] = useState<UserOrder[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            navigate('/login');
            return;
        }

        if (isAuthenticated) {
            fetchOrders();
        }
    }, [authLoading, isAuthenticated, navigate]);

    const fetchOrders = async () => {
        setIsLoading(true);
        setError('');
        try {
            const data = await api.getUserOrders();
            setOrders(data);
        } catch (err) {
            setError('Không thể tải danh sách đơn hàng. Vui lòng thử lại.');
            console.error('Failed to fetch orders:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const formatPrice = (price: number) => new Intl.NumberFormat('vi-VN').format(price) + 'đ';

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    const getStatusConfig = (status: OrderStatus) => {
        const configs = {
            PENDING: { label: 'Chờ xử lý', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
            CONFIRMED: { label: 'Đã xác nhận', color: 'bg-blue-100 text-blue-700 border-blue-200' },
            SHIPPED: { label: 'Đang giao', color: 'bg-purple-100 text-purple-700 border-purple-200' },
            DELIVERED: { label: 'Đã giao', color: 'bg-green-100 text-green-700 border-green-200' },
            CANCELLED: { label: 'Đã hủy', color: 'bg-red-100 text-red-700 border-red-200' },
        };
        return configs[status] || configs.PENDING;
    };

    if (authLoading || isLoading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="max-w-[1000px] mx-auto px-6 py-10">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="font-display text-3xl font-bold text-primary mb-2">Đơn hàng của tôi</h1>
                    <p className="text-primary/60">Theo dõi và quản lý đơn hàng của bạn</p>
                </div>
                <Link
                    to="/profile"
                    className="flex items-center gap-2 text-primary/60 hover:text-primary transition-colors text-sm font-bold"
                >
                    <ArrowLeft className="w-4 h-4" /> Quay lại
                </Link>
            </div>

            {/* Error State */}
            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-600 text-sm">
                    {error}
                </div>
            )}

            {/* Empty State */}
            {!isLoading && orders.length === 0 && (
                <div className="bg-white rounded-3xl shadow-sm border border-stone-100 p-12 text-center">
                    <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-6">
                        <ShoppingBag className="w-10 h-10 text-primary/40" />
                    </div>
                    <h2 className="font-display text-2xl font-bold text-primary mb-3">Chưa có đơn hàng nào</h2>
                    <p className="text-primary/60 mb-8">Hãy khám phá các sản phẩm và đặt hàng ngay!</p>
                    <Link
                        to="/shop"
                        className="inline-block bg-primary hover:bg-primary/90 text-white font-bold px-8 py-3 rounded-full transition-all"
                    >
                        Mua sắm ngay
                    </Link>
                </div>
            )}

            {/* Orders List */}
            {orders.length > 0 && (
                <div className="space-y-6">
                    {orders.map((order) => {
                        const statusConfig = getStatusConfig(order.status);
                        return (
                            <div
                                key={order.id}
                                className="bg-white rounded-3xl shadow-sm border border-stone-100 overflow-hidden hover:shadow-md transition-shadow"
                            >
                                {/* Order Header */}
                                <div className="bg-cream p-6 border-b border-stone-100">
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                                                <Package className="w-6 h-6 text-primary" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-primary/40 uppercase tracking-wider font-bold mb-1">
                                                    Mã đơn hàng
                                                </p>
                                                <p className="font-mono text-sm font-bold text-primary">
                                                    #{order.id.slice(0, 8).toUpperCase()}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center gap-2 text-sm text-primary/60">
                                                <Calendar className="w-4 h-4" />
                                                {formatDate(order.createdAt)}
                                            </div>
                                            <span
                                                className={`px-4 py-2 rounded-full text-xs font-bold border ${statusConfig.color}`}
                                            >
                                                {statusConfig.label}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Order Items */}
                                <div className="p-6">
                                    <div className="space-y-4 mb-6">
                                        {order.items.map((item) => (
                                            <div key={item.id} className="flex items-center gap-4">
                                                <div
                                                    className="w-16 h-16 rounded-xl bg-cream overflow-hidden flex-shrink-0 bg-cover bg-center border border-primary/5"
                                                    style={{ backgroundImage: `url('${item.product.image?.startsWith('http') ? item.product.image : `${api.baseUrl}${item.product.image}`}')` }}
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-bold text-primary truncate">{item.product.name}</p>
                                                    <p className="text-sm text-primary/60">
                                                        Số lượng: {item.quantity} × {formatPrice(item.price)}
                                                    </p>
                                                </div>
                                                <p className="font-bold text-primary flex-shrink-0">
                                                    {formatPrice(item.price * item.quantity)}
                                                </p>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Order Total */}
                                    <div className="pt-6 border-t border-stone-100">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2 text-primary/60">
                                                <CreditCard className="w-5 h-5" />
                                                <span className="font-bold">Tổng cộng</span>
                                            </div>
                                            <p className="text-2xl font-black text-primary">{formatPrice(order.total)}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default Orders;
