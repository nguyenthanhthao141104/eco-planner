import React, { useState, useEffect } from 'react';
import { ShoppingBag, Search, Eye, Package, Truck, CheckCircle, XCircle, Loader2, ChevronRight } from 'lucide-react';
import { api, Order, OrderStatus } from '../../services/api';

const ORDER_STATUS_LABELS: Record<OrderStatus, { label: string; color: string; icon: React.ElementType }> = {
    PENDING: { label: 'Chờ duyệt', color: 'bg-yellow-100 text-yellow-800', icon: Package },
    CONFIRMED: { label: 'Đang xử lý', color: 'bg-blue-100 text-blue-800', icon: Package },
    SHIPPED: { label: 'Đang giao', color: 'bg-purple-100 text-purple-800', icon: Truck },
    DELIVERED: { label: 'Đã giao', color: 'bg-green-100 text-green-800', icon: CheckCircle },
    CANCELLED: { label: 'Đã huỷ', color: 'bg-red-100 text-red-800', icon: XCircle },
};

// Status flow: only forward, no going back
const NEXT_STATUS: Record<OrderStatus, OrderStatus[]> = {
    PENDING: ['CONFIRMED', 'CANCELLED'],
    CONFIRMED: ['SHIPPED', 'CANCELLED'],
    SHIPPED: ['DELIVERED', 'CANCELLED'],
    DELIVERED: [],
    CANCELLED: [],
};

const AdminOrders: React.FC = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadOrders();
    }, []);

    const loadOrders = async () => {
        try {
            setIsLoading(true);
            const data = await api.getOrders();
            setOrders(data);
        } catch (error) {
            console.error('Failed to load orders:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
        try {
            setUpdatingId(orderId);
            await api.updateOrderStatus(orderId, newStatus);
            setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
        } catch (error) {
            console.error('Failed to update status:', error);
            alert('Không thể cập nhật trạng thái. Vui lòng thử lại.');
        } finally {
            setUpdatingId(null);
        }
    };

    const formatPrice = (price: number) => new Intl.NumberFormat('vi-VN').format(price) + 'đ';
    const formatDate = (date: string) => new Date(date).toLocaleDateString('vi-VN');

    const filteredOrders = orders.filter(o =>
        o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.user?.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (isLoading) {
        return (
            <div className="p-8 lg:p-12 flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <span className="ml-2 text-gray-500">Đang tải đơn hàng...</span>
            </div>
        );
    }

    return (
        <div className="p-8 lg:p-12 max-w-7xl mx-auto w-full">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10">
                <div>
                    <h2 className="text-3xl md:text-4xl font-extrabold text-[#1a2e24] tracking-tight font-display">Quản lý đơn hàng</h2>
                    <p className="text-[#5D7365] text-base font-medium">{orders.length} đơn hàng trong hệ thống.</p>
                </div>
                <div className="relative w-full md:w-80">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Tìm kiếm đơn hàng..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full rounded-xl border-none bg-white py-3 pl-12 pr-4 text-sm shadow-sm focus:ring-2 focus:ring-[#129ca1]"
                    />
                </div>
            </div>

            {filteredOrders.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                    {searchTerm ? 'Không tìm thấy đơn hàng' : 'Chưa có đơn hàng nào'}
                </div>
            ) : (
                <div className="flex flex-col gap-4">
                    {filteredOrders.map((order) => {
                        const statusInfo = ORDER_STATUS_LABELS[order.status];
                        const StatusIcon = statusInfo.icon;
                        const nextStatuses = NEXT_STATUS[order.status];

                        return (
                            <div key={order.id} className="rounded-2xl bg-white p-6 shadow-sm hover:shadow-md transition-all">
                                <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                                    <div className="flex items-center gap-4">
                                        <div>
                                            <span className="font-bold text-[#1a2e24] text-lg">{order.id.slice(0, 8).toUpperCase()}</span>
                                            <p className="text-xs text-gray-500">{formatDate(order.createdAt)}</p>
                                        </div>
                                        <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${statusInfo.color}`}>
                                            <StatusIcon className="w-3.5 h-3.5" />
                                            {statusInfo.label}
                                        </span>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-[#1a2e24] text-lg">{formatPrice(order.total)}</p>
                                        <p className="text-xs text-gray-500">{order.items.length} sản phẩm</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100">
                                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                                        <ShoppingBag className="w-5 h-5 text-gray-500" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-[#1a2e24]">{order.user?.name || 'Khách vãng lai'}</p>
                                        <p className="text-sm text-gray-500">{order.user?.email || 'Chưa cung cấp email'}</p>
                                    </div>
                                </div>

                                {/* Product thumbnails */}
                                <div className="flex gap-2 mb-4">
                                    {order.items.slice(0, 4).map((item, i) => (
                                        <div key={i} className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden">
                                            <img src={item.product.image?.startsWith('http') ? item.product.image : `${api.baseUrl}${item.product.image}` || 'https://placehold.co/48'} alt={item.product.name} className="w-full h-full object-cover" />
                                        </div>
                                    ))}
                                    {order.items.length > 4 && (
                                        <div className="w-12 h-12 rounded-lg bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
                                            +{order.items.length - 4}
                                        </div>
                                    )}
                                </div>

                                {/* Status actions */}
                                {nextStatuses.length > 0 && (
                                    <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-100">
                                        <span className="text-xs text-gray-500 self-center mr-2">Chuyển trạng thái:</span>
                                        {nextStatuses.map(nextStatus => {
                                            const info = ORDER_STATUS_LABELS[nextStatus];
                                            return (
                                                <button
                                                    key={nextStatus}
                                                    onClick={() => handleStatusChange(order.id, nextStatus)}
                                                    disabled={updatingId === order.id}
                                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${nextStatus === 'CANCELLED'
                                                        ? 'bg-red-50 text-red-600 hover:bg-red-100'
                                                        : 'bg-green-50 text-green-700 hover:bg-green-100'
                                                        } disabled:opacity-50`}
                                                >
                                                    {updatingId === order.id ? (
                                                        <Loader2 className="w-3 h-3 animate-spin" />
                                                    ) : (
                                                        <ChevronRight className="w-3 h-3" />
                                                    )}
                                                    {info.label}
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default AdminOrders;
