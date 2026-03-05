import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle, Package, Truck, Home, ShoppingBag, CreditCard } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { api, SystemSettings, DEFAULT_SETTINGS } from '../services/api';

const OrderSuccess: React.FC = () => {
    const { clearCart } = useCart();
    const [searchParams] = useSearchParams();
    const orderId = searchParams.get('orderId');
    const paymentMethod = searchParams.get('method');
    const [settings, setSettings] = useState<SystemSettings>(DEFAULT_SETTINGS);

    useEffect(() => {
        // Clear cart after successful order
        clearCart();

        // Fetch settings for bank instructions if needed
        const fetchSettings = async () => {
            try {
                const data = await api.getSettings();
                setSettings(data);
            } catch (err) {
                console.error('Failed to fetch settings', err);
            }
        };
        fetchSettings();
    }, []);

    const formatPrice = (price: number) => new Intl.NumberFormat('vi-VN').format(price) + 'đ';

    return (
        <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
            <div className="max-w-lg w-full text-center">
                {/* Success Animation */}
                <div className="relative mb-8">
                    <div className="w-32 h-32 mx-auto bg-green-100 rounded-full flex items-center justify-center animate-pulse">
                        <CheckCircle className="w-16 h-16 text-green-600" />
                    </div>
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-green-200 rounded-full animate-ping opacity-20"></div>
                </div>

                <h1 className="font-display text-3xl md:text-4xl font-bold text-charcoal mb-4">
                    Đặt hàng thành công! 🎉
                </h1>
                <p className="text-charcoal/60 text-lg mb-8">
                    Cảm ơn bạn đã mua sắm tại MEDE. Đơn hàng của bạn đang được xử lý.
                </p>

                {/* Bank Transfer Instructions for BANK method */}
                {paymentMethod === 'BANK' && (
                    <div className="mb-8 bg-primary/5 p-6 rounded-3xl border border-primary/20 text-left">
                        <h2 className="font-bold text-primary mb-4 flex items-center gap-2">
                            <CreditCard className="w-5 h-5" /> Hướng dẫn chuyển khoản
                        </h2>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-primary/60">Ngân hàng:</span>
                                <span className="text-primary font-bold">{settings.payment.bankName}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-primary/60">Số tài khoản:</span>
                                <span className="text-primary font-bold">{settings.payment.accountNumber}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-primary/60">Chủ tài khoản:</span>
                                <span className="text-primary font-bold uppercase">{settings.payment.accountHolder}</span>
                            </div>
                            <div className="pt-3 border-t border-primary/10">
                                <p className="text-xs text-primary/60 mb-1">Nội dung chuyển khoản:</p>
                                <p className="font-bold text-primary text-base bg-white p-3 rounded-xl border border-primary/10">
                                    {settings.payment.transferContent.replace('{orderId}', orderId || '')}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Order Info Card */}
                <div className="bg-cream rounded-2xl p-6 mb-8 text-left border border-stone-200">
                    <div className="flex items-center justify-between mb-4 pb-4 border-b border-primary/10">
                        <div>
                            <p className="text-sm text-charcoal/60">Mã đơn hàng</p>
                            <p className="font-bold text-primary text-lg">{orderId ? `#${orderId.slice(0, 8)}...` : '---'}</p>
                        </div>
                        <div className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm font-bold">
                            Đang chờ xử lý
                        </div>
                    </div>

                    {/* Timeline */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                                <CheckCircle className="w-5 h-5 text-yellow-600" />
                            </div>
                            <div>
                                <p className="font-bold text-charcoal">Đơn hàng đang chờ xử lý</p>
                                <p className="text-sm text-charcoal/60">Vừa xong</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 opacity-50">
                            <div className="w-10 h-10 bg-stone-100 rounded-full flex items-center justify-center">
                                <Package className="w-5 h-5 text-stone-400" />
                            </div>
                            <div>
                                <p className="font-medium text-charcoal">Đang chuẩn bị hàng</p>
                                <p className="text-sm text-charcoal/60">Dự kiến 1-2 ngày</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 opacity-50">
                            <div className="w-10 h-10 bg-stone-100 rounded-full flex items-center justify-center">
                                <Truck className="w-5 h-5 text-stone-400" />
                            </div>
                            <div>
                                <p className="font-medium text-charcoal">Đang giao hàng</p>
                                <p className="text-sm text-charcoal/60">Dự kiến 2-4 ngày</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                        to="/"
                        className="flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white font-bold px-8 py-4 rounded-full transition-all shadow-lg shadow-primary/20"
                    >
                        <Home className="w-5 h-5" /> Về trang chủ
                    </Link>
                    <Link
                        to="/shop"
                        className="flex items-center justify-center gap-2 bg-white border border-stone-200 hover:bg-stone-50 text-charcoal font-bold px-8 py-4 rounded-full transition-all"
                    >
                        <ShoppingBag className="w-5 h-5" /> Tiếp tục mua sắm
                    </Link>
                </div>

                {/* Email Note */}
                <p className="text-sm text-charcoal/50 mt-8">
                    📧 Email xác nhận sẽ được gửi đến địa chỉ của bạn.
                </p>
            </div>
        </div>
    );
};

export default OrderSuccess;
