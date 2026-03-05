import React, { useState, useEffect } from 'react';
import { Users, Search, ShoppingBag, User, Plus, Lock, Unlock, Loader2, X, Shield } from 'lucide-react';
import { api, Customer } from '../../services/api';

const AdminCustomers: React.FC = () => {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [togglingId, setTogglingId] = useState<string | null>(null);

    // Create form state
    const [newUser, setNewUser] = useState({ email: '', password: '', name: '', role: 'CUSTOMER' as 'CUSTOMER' | 'ADMIN' });
    const [creating, setCreating] = useState(false);
    const [createError, setCreateError] = useState('');

    useEffect(() => {
        loadCustomers();
    }, []);

    const loadCustomers = async () => {
        try {
            setIsLoading(true);
            const data = await api.getCustomers();
            setCustomers(data);
        } catch (error) {
            console.error('Failed to load customers:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleToggleLock = async (customerId: string) => {
        try {
            setTogglingId(customerId);
            const updated = await api.toggleCustomerLock(customerId);
            setCustomers(customers.map(c => c.id === customerId ? { ...c, isLocked: updated.isLocked } : c));
        } catch (error) {
            console.error('Failed to toggle lock:', error);
            alert('Không thể thay đổi trạng thái tài khoản.');
        } finally {
            setTogglingId(null);
        }
    };

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setCreateError('');

        if (!newUser.email || !newUser.password || !newUser.name) {
            setCreateError('Vui lòng điền đầy đủ thông tin');
            return;
        }

        try {
            setCreating(true);
            const created = await api.createCustomer(newUser);
            setCustomers([{ ...created, orderCount: 0, totalSpent: 0 }, ...customers]);
            setShowCreateModal(false);
            setNewUser({ email: '', password: '', name: '', role: 'CUSTOMER' });
        } catch (error: unknown) {
            const err = error as Error;
            setCreateError(err.message || 'Không thể tạo tài khoản');
        } finally {
            setCreating(false);
        }
    };

    const formatPrice = (price: number) => new Intl.NumberFormat('vi-VN').format(price) + 'đ';

    const filteredCustomers = customers.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const stats = {
        total: customers.length,
        admins: customers.filter(c => c.role === 'ADMIN').length,
        locked: customers.filter(c => c.isLocked).length,
        totalRevenue: customers.reduce((sum, c) => sum + c.totalSpent, 0),
    };

    if (isLoading) {
        return (
            <div className="p-8 lg:p-12 flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <span className="ml-2 text-gray-500">Đang tải khách hàng...</span>
            </div>
        );
    }

    return (
        <div className="p-8 lg:p-12 max-w-7xl mx-auto w-full">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
                <div>
                    <h2 className="text-3xl md:text-4xl font-extrabold text-[#1a2e24] tracking-tight font-display">Quản lý khách hàng</h2>
                    <p className="text-[#5D7365] text-base font-medium">{customers.length} tài khoản trong hệ thống.</p>
                </div>
                <div className="flex gap-4 w-full md:w-auto">
                    <div className="relative flex-1 md:w-80">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full rounded-xl border-none bg-white py-3 pl-12 pr-4 text-sm shadow-sm focus:ring-2 focus:ring-[#129ca1]"
                        />
                    </div>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center gap-2 rounded-xl bg-[#129ca1] hover:bg-[#0e7c80] px-6 py-3 text-sm font-bold text-white shadow-lg whitespace-nowrap"
                    >
                        <Plus className="w-5 h-5" /> Tạo tài khoản
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-white rounded-2xl p-5 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#9CAF88]/20 rounded-xl flex items-center justify-center">
                            <Users className="w-5 h-5 text-[#9CAF88]" />
                        </div>
                        <div>
                            <p className="text-xl font-bold text-[#1a2e24]">{stats.total}</p>
                            <p className="text-xs text-gray-500">Tổng tài khoản</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-2xl p-5 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#D4AF37]/20 rounded-xl flex items-center justify-center">
                            <Shield className="w-5 h-5 text-[#D4AF37]" />
                        </div>
                        <div>
                            <p className="text-xl font-bold text-[#1a2e24]">{stats.admins}</p>
                            <p className="text-xs text-gray-500">Admin</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-2xl p-5 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                            <Lock className="w-5 h-5 text-red-500" />
                        </div>
                        <div>
                            <p className="text-xl font-bold text-[#1a2e24]">{stats.locked}</p>
                            <p className="text-xs text-gray-500">Đã khoá</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-2xl p-5 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#CB8B78]/20 rounded-xl flex items-center justify-center">
                            <ShoppingBag className="w-5 h-5 text-[#CB8B78]" />
                        </div>
                        <div>
                            <p className="text-xl font-bold text-[#1a2e24]">{formatPrice(stats.totalRevenue)}</p>
                            <p className="text-xs text-gray-500">Tổng doanh thu</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Customer list */}
            <div className="flex flex-col gap-3">
                {filteredCustomers.map((customer) => (
                    <div key={customer.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center rounded-2xl bg-white p-5 shadow-sm hover:shadow-md transition-all">
                        <div className="col-span-1 md:col-span-5 flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${customer.isLocked ? 'bg-red-100' : 'bg-[#9CAF88]/20'}`}>
                                {customer.isLocked ? (
                                    <Lock className="w-5 h-5 text-red-500" />
                                ) : (
                                    <User className="w-5 h-5 text-[#9CAF88]" />
                                )}
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <p className="font-bold text-[#1a2e24]">{customer.name}</p>
                                    {customer.role === 'ADMIN' && (
                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-700">ADMIN</span>
                                    )}
                                    {customer.isLocked && (
                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-600">KHOÁ</span>
                                    )}
                                </div>
                                <p className="text-sm text-gray-500">{customer.email}</p>
                            </div>
                        </div>
                        <div className="col-span-1 md:col-span-2 flex md:justify-center">
                            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
                                <ShoppingBag className="w-3.5 h-3.5" />
                                {customer.orderCount} đơn
                            </span>
                        </div>
                        <div className="col-span-1 md:col-span-2 flex md:justify-center font-bold text-[#1a2e24]">
                            {formatPrice(customer.totalSpent)}
                        </div>
                        <div className="col-span-1 md:col-span-2 flex md:justify-end text-gray-500 text-sm">
                            {new Date(customer.createdAt).toLocaleDateString('vi-VN')}
                        </div>
                        <div className="col-span-1 md:col-span-1 flex justify-end">
                            <button
                                onClick={() => handleToggleLock(customer.id)}
                                disabled={togglingId === customer.id}
                                className={`p-2 rounded-lg transition-colors ${customer.isLocked
                                        ? 'text-green-600 hover:bg-green-50'
                                        : 'text-red-500 hover:bg-red-50'
                                    } disabled:opacity-50`}
                                title={customer.isLocked ? 'Mở khoá' : 'Khoá tài khoản'}
                            >
                                {togglingId === customer.id ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : customer.isLocked ? (
                                    <Unlock className="w-5 h-5" />
                                ) : (
                                    <Lock className="w-5 h-5" />
                                )}
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Create Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-[#1a2e24]">Tạo tài khoản mới</h3>
                            <button onClick={() => setShowCreateModal(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        {createError && (
                            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-xl mb-4 text-sm">
                                {createError}
                            </div>
                        )}

                        <form onSubmit={handleCreateUser} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Họ tên</label>
                                <input
                                    type="text"
                                    value={newUser.name}
                                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#129ca1] focus:border-transparent"
                                    placeholder="Nguyễn Văn A"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input
                                    type="email"
                                    value={newUser.email}
                                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#129ca1] focus:border-transparent"
                                    placeholder="email@example.com"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu</label>
                                <input
                                    type="password"
                                    value={newUser.password}
                                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#129ca1] focus:border-transparent"
                                    placeholder="••••••••"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Vai trò</label>
                                <select
                                    value={newUser.role}
                                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value as 'CUSTOMER' | 'ADMIN' })}
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#129ca1] focus:border-transparent"
                                >
                                    <option value="CUSTOMER">Khách hàng</option>
                                    <option value="ADMIN">Admin</option>
                                </select>
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50"
                                >
                                    Huỷ
                                </button>
                                <button
                                    type="submit"
                                    disabled={creating}
                                    className="flex-1 px-4 py-2.5 rounded-xl bg-[#129ca1] text-white font-bold hover:bg-[#0e7c80] disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                                    Tạo
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminCustomers;
