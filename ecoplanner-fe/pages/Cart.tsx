import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Minus, Plus, Trash2, ArrowRight, ShieldCheck, Truck, Leaf, ArrowLeft } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { api } from '../services/api';

const Cart: React.FC = () => {
    const navigate = useNavigate();
    const { items, totalItems, totalPrice, updateQuantity, removeItem, clearCart } = useCart();

    const formatPrice = (price: number) => new Intl.NumberFormat('vi-VN').format(price) + 'đ';

    const shippingFee = totalPrice >= 500000 ? 0 : 30000;
    const discount = shippingFee > 0 ? 15000 : 30000;
    const finalTotal = totalPrice + shippingFee - discount;

    if (items.length === 0) {
        return (
            <div className="max-w-[1200px] mx-auto px-4 py-20 text-center">
                <div className="text-6xl mb-4">🛒</div>
                <h2 className="font-display text-2xl font-bold text-charcoal mb-4">Giỏ hàng trống</h2>
                <p className="text-charcoal/60 mb-8">Hãy khám phá các sản phẩm thân thiện môi trường của chúng tôi!</p>
                <Link to="/shop" className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-white font-bold px-8 py-3 rounded-full transition-all">
                    <ArrowLeft className="w-4 h-4" /> Tiếp tục mua sắm
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-[1200px] mx-auto px-4 py-8">
            {/* Breadcrumbs */}
            <div className="flex items-center gap-2 mb-6 text-sm">
                <Link to="/" className="text-primary/60 hover:text-primary">Trang chủ</Link>
                <span className="text-primary/40">›</span>
                <span className="text-primary font-medium">Giỏ hàng</span>
            </div>

            <h2 className="text-3xl font-bold text-primary mb-8">Giỏ hàng của bạn ({totalItems} sản phẩm)</h2>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Cart Items */}
                <div className="lg:col-span-8 space-y-4">
                    {items.map((item) => (
                        <div key={item.product.id} className="bg-cream rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-6 shadow-sm hover:-translate-y-0.5 transition-transform">
                            <div
                                className="w-32 h-32 rounded-xl bg-cover bg-center flex-shrink-0"
                                style={{ backgroundImage: `url('${item.product.image?.startsWith('http') ? item.product.image : `${api.baseUrl}${item.product.image}` || 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=400'}')` }}
                            />
                            <div className="flex-1 space-y-1">
                                <h3 className="text-lg font-bold text-primary leading-tight">{item.product.name}</h3>
                                <p className="text-sm text-primary/60">{item.product.description?.substring(0, 50)}...</p>
                                <div className="font-bold text-lg">{formatPrice(item.product.price)}</div>
                            </div>
                            <div className="flex items-center gap-6">
                                <div className="flex items-center bg-white/50 rounded-full border border-primary/10 p-1">
                                    <button
                                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-primary/10 text-terracotta transition-colors"
                                    >
                                        <Minus className="w-4 h-4" />
                                    </button>
                                    <span className="px-4 font-bold text-primary">{item.quantity}</span>
                                    <button
                                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-primary/10 text-terracotta transition-colors"
                                    >
                                        <Plus className="w-4 h-4" />
                                    </button>
                                </div>
                                <button
                                    onClick={() => removeItem(item.product.id)}
                                    className="text-red-400 hover:bg-red-50 p-2 rounded-full transition-colors"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    ))}

                    {/* Eco Note */}
                    <div className="bg-primary/5 rounded-2xl p-4 flex items-center gap-4 text-sm text-primary/80">
                        <Leaf className="w-5 h-5 text-primary" />
                        <p>Đơn hàng này giúp giảm thiểu 1.5kg khí thải CO2 thông qua việc sử dụng bao bì phân hủy sinh học.</p>
                    </div>
                </div>

                {/* Summary Sidebar */}
                <div className="lg:col-span-4 sticky top-24">
                    <div className="bg-cream rounded-2xl p-8 space-y-6 shadow-sm">
                        <h3 className="text-xl font-bold text-primary">Tổng cộng</h3>

                        <div className="space-y-4 border-b border-primary/10 pb-6">
                            <div className="flex justify-between items-center">
                                <span className="text-primary/70">Tạm tính</span>
                                <span className="font-medium">{formatPrice(totalPrice)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-primary/70">Phí vận chuyển</span>
                                <span className="font-medium">{shippingFee === 0 ? 'Miễn phí' : formatPrice(shippingFee)}</span>
                            </div>
                            <div className="flex justify-between items-center text-primary/70 text-sm italic">
                                <span>Giảm giá</span>
                                <span className="text-green-600">-{formatPrice(discount)}</span>
                            </div>
                        </div>

                        <div className="flex justify-between items-end pt-2">
                            <span className="text-lg font-bold text-primary">Thành tiền</span>
                            <div className="text-right">
                                <div className="text-3xl font-bold text-primary leading-none">{formatPrice(finalTotal)}</div>
                                <p className="text-[10px] text-primary/40 uppercase tracking-widest mt-1">Đã bao gồm VAT</p>
                            </div>
                        </div>

                        <button
                            onClick={() => navigate('/checkout')}
                            className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-5 rounded-full shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-3"
                        >
                            <span>Tiến hành thanh toán</span>
                            <ArrowRight className="w-5 h-5" />
                        </button>

                        <div className="pt-4 flex flex-col gap-3">
                            <div className="flex items-center gap-3 text-xs text-primary/60">
                                <ShieldCheck className="w-4 h-4" />
                                Thanh toán an toàn & bảo mật
                            </div>
                            <div className="flex items-center gap-3 text-xs text-primary/60">
                                <Truck className="w-4 h-4" />
                                Giao hàng từ 2-4 ngày làm việc
                            </div>
                        </div>
                    </div>

                    {/* Promo Code */}
                    <div className="mt-4 bg-orange-50 rounded-2xl p-6 border border-orange-200">
                        <p className="text-sm font-semibold text-orange-600 mb-2">Có mã giảm giá?</p>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                placeholder="Nhập mã tại đây"
                                className="flex-1 bg-white rounded-lg border-none focus:ring-1 focus:ring-orange-400 text-sm placeholder:text-orange-300 px-3 py-2"
                            />
                            <button className="bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-bold hover:opacity-90 transition-opacity">
                                Áp dụng
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart;
