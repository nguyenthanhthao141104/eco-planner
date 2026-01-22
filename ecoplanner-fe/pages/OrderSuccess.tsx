import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, Package, Truck, ArrowRight, Home, ShoppingBag } from 'lucide-react';
import { useCart } from '../contexts/CartContext';

const OrderSuccess: React.FC = () => {
    const { clearCart } = useCart();
    const orderNumber = `ECO${Date.now().toString().slice(-8)}`;

    useEffect(() => {
        // Clear cart after successful order
        clearCart();
    }, []);

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

                {/* Order Info Card */}
                <div className="bg-cream rounded-2xl p-6 mb-8 text-left">
                    <div className="flex items-center justify-between mb-4 pb-4 border-b border-primary/10">
                        <div>
                            <p className="text-sm text-charcoal/60">Mã đơn hàng</p>
                            <p className="font-bold text-primary text-lg">{orderNumber}</p>
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
                        className="flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white font-bold px-8 py-4 rounded-full transition-all"
                    >
                        <Home className="w-5 h-5" /> Về trang chủ
                    </Link>
                    <Link
                        to="/shop"
                        className="flex items-center justify-center gap-2 bg-stone-100 hover:bg-stone-200 text-charcoal font-bold px-8 py-4 rounded-full transition-all"
                    >
                        <ShoppingBag className="w-5 h-5" /> Tiếp tục mua sắm
                    </Link>
                </div>

                {/* Email Note */}
                <p className="text-sm text-charcoal/50 mt-8">
                    📧 Email xác nhận đã được gửi đến địa chỉ email của bạn
                </p>
            </div>
        </div>
    );
};

export default OrderSuccess;
