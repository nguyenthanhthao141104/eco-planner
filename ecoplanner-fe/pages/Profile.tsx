import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, LogOut, ShoppingBag, Settings, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Profile: React.FC = () => {
    const navigate = useNavigate();
    const { user, isLoading, logout, isAuthenticated } = useAuth();

    if (isLoading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!isAuthenticated || !user) {
        return (
            <div className="max-w-[800px] mx-auto px-6 py-20 text-center">
                <User className="w-16 h-16 mx-auto text-stone-300 mb-4" />
                <h2 className="font-display text-2xl font-bold text-charcoal mb-4">Bạn chưa đăng nhập</h2>
                <p className="text-charcoal/60 mb-6">Đăng nhập để xem thông tin tài khoản</p>
                <Link
                    to="/login"
                    className="inline-block bg-primary hover:bg-primary/90 text-white font-bold px-8 py-3 rounded-full transition-all"
                >
                    Đăng nhập
                </Link>
            </div>
        );
    }

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <div className="max-w-[800px] mx-auto px-6 py-10">
            <h1 className="font-display text-3xl font-bold text-charcoal mb-8">Tài khoản</h1>

            <div className="bg-white rounded-3xl shadow-sm border border-stone-100 overflow-hidden">
                {/* Profile Header */}
                <div className="bg-gradient-to-r from-primary/10 to-secondary/10 p-8">
                    <div className="flex items-center gap-6">
                        <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center">
                            <User className="w-10 h-10 text-primary" />
                        </div>
                        <div>
                            <h2 className="font-display text-2xl font-bold text-charcoal">{user.name}</h2>
                            <p className="text-charcoal/60 flex items-center gap-2 mt-1">
                                <Mail className="w-4 h-4" /> {user.email}
                            </p>
                            <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-bold ${user.role === 'ADMIN' ? 'bg-red-100 text-red-600' :
                                user.role === 'SUPPORT' ? 'bg-blue-100 text-blue-600' :
                                    'bg-green-100 text-green-600'
                                }`}>
                                {user.role === 'ADMIN' ? 'Quản trị viên' : user.role === 'SUPPORT' ? 'Hỗ trợ' : 'Khách hàng'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Menu Items */}
                <div className="divide-y divide-stone-100">
                    <Link to="/orders" className="flex items-center gap-4 p-6 hover:bg-stone-50 transition-colors">
                        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                            <ShoppingBag className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <h3 className="font-bold text-charcoal">Đơn hàng của tôi</h3>
                            <p className="text-sm text-charcoal/60">Xem lịch sử mua hàng</p>
                        </div>
                    </Link>

                    <Link to="/settings" className="flex items-center gap-4 p-6 hover:bg-stone-50 transition-colors">
                        <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center">
                            <Settings className="w-6 h-6 text-secondary" />
                        </div>
                        <div>
                            <h3 className="font-bold text-charcoal">Cài đặt</h3>
                            <p className="text-sm text-charcoal/60">Cập nhật thông tin cá nhân</p>
                        </div>
                    </Link>

                    {user.role === 'ADMIN' && (
                        <Link to="/admin" className="flex items-center gap-4 p-6 hover:bg-stone-50 transition-colors">
                            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                                <Settings className="w-6 h-6 text-red-600" />
                            </div>
                            <div>
                                <h3 className="font-bold text-charcoal">Quản trị Admin</h3>
                                <p className="text-sm text-charcoal/60">Dashboard, sản phẩm, chat...</p>
                            </div>
                        </Link>
                    )}

                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-4 p-6 hover:bg-red-50 transition-colors w-full text-left"
                    >
                        <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                            <LogOut className="w-6 h-6 text-red-600" />
                        </div>
                        <div>
                            <h3 className="font-bold text-red-600">Đăng xuất</h3>
                            <p className="text-sm text-charcoal/60">Thoát khỏi tài khoản</p>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Profile;
