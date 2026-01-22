import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, ShieldCheck, Loader2, CreditCard, Truck, Landmark } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { api, ShippingAddress, SystemSettings, DEFAULT_SETTINGS } from '../services/api';

type PaymentMethod = 'VNPAY' | 'COD' | 'BANK';

interface Location {
    code: number;
    name: string;
}

const Checkout: React.FC = () => {
    const navigate = useNavigate();
    const { items, totalPrice, clearCart } = useCart();
    const { user, isAuthenticated } = useAuth();
    const [step, setStep] = useState(1);
    const [settings, setSettings] = useState<SystemSettings>(DEFAULT_SETTINGS);
    const [formData, setFormData] = useState<ShippingAddress>({
        name: '',
        phone: '',
        address: '',
        city: '',
        district: '',
        ward: '',
    });
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('VNPAY');
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState('');

    // Administrative data state
    const [provinces, setProvinces] = useState<Location[]>([]);
    const [districts, setDistricts] = useState<Location[]>([]);
    const [wards, setWards] = useState<Location[]>([]);
    const [loadingLocations, setLoadingLocations] = useState({
        provinces: false,
        districts: false,
        wards: false
    });

    // Auto-populate form with user profile data
    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                name: user.name || prev.name,
                phone: user.phone || prev.phone,
                address: user.address || prev.address,
                city: user.city || prev.city,
                district: user.district || prev.district,
                ward: user.ward || prev.ward,
            }));
        }
    }, [user]);

    // Fetch Regions on mount
    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const data = await api.getSettings();
                setSettings(data);
            } catch (err) {
                console.error('Failed to fetch settings', err);
            }
        };
        fetchSettings();

        const fetchProvinces = async () => {
            setLoadingLocations(prev => ({ ...prev, provinces: true }));
            try {
                const response = await fetch('https://provinces.open-api.vn/api/p/');
                const data = await response.json();
                setProvinces(data);
            } catch (err) {
                console.error('Failed to fetch provinces', err);
            } finally {
                setLoadingLocations(prev => ({ ...prev, provinces: false }));
            }
        };
        fetchProvinces();
    }, []);

    // Fetch Districts when city changes
    useEffect(() => {
        const province = provinces.find(p => p.name === formData.city);
        if (!province) {
            setDistricts([]);
            setWards([]);
            return;
        }

        const fetchDistricts = async () => {
            setLoadingLocations(prev => ({ ...prev, districts: true }));
            try {
                const response = await fetch(`https://provinces.open-api.vn/api/p/${province.code}?depth=2`);
                const data = await response.json();
                setDistricts(data.districts || []);
                // Don't reset district/ward if they exist (from user profile)
            } catch (err) {
                console.error('Failed to fetch districts', err);
            } finally {
                setLoadingLocations(prev => ({ ...prev, districts: false }));
            }
        };
        fetchDistricts();
    }, [formData.city, provinces]);

    // Fetch Wards when district changes
    useEffect(() => {
        const district = districts.find(d => d.name === formData.district);
        if (!district) {
            setWards([]);
            return;
        }

        const fetchWards = async () => {
            setLoadingLocations(prev => ({ ...prev, wards: true }));
            try {
                const response = await fetch(`https://provinces.open-api.vn/api/d/${district.code}?depth=2`);
                const data = await response.json();
                setWards(data.wards || []);
                // Don't reset ward if it exists (from user profile)
            } catch (err) {
                console.error('Failed to fetch wards', err);
            } finally {
                setLoadingLocations(prev => ({ ...prev, wards: false }));
            }
        };
        fetchWards();
    }, [formData.district, districts]);

    const formatPrice = (price: number) => new Intl.NumberFormat('vi-VN').format(price) + 'đ';

    const shippingFee = totalPrice >= 500000 ? 0 : 30000;
    const discount = shippingFee > 0 ? 15000 : 30000;
    const finalTotal = totalPrice + shippingFee - discount;

    // Redirect if not logged in
    if (!isAuthenticated) {
        return (
            <div className="max-w-[800px] mx-auto px-6 py-20 text-center">
                <h2 className="font-display text-2xl font-bold text-charcoal mb-4">Vui lòng đăng nhập</h2>
                <p className="text-charcoal/60 mb-6">Bạn cần đăng nhập để thanh toán</p>
                <Link to="/login" className="inline-block bg-primary text-white font-bold px-8 py-3 rounded-full">
                    Đăng nhập
                </Link>
            </div>
        );
    }

    if (items.length === 0) {
        return (
            <div className="max-w-[800px] mx-auto px-6 py-20 text-center">
                <h2 className="font-display text-2xl font-bold text-charcoal mb-4">Giỏ hàng trống</h2>
                <p className="text-charcoal/60 mb-6">Vui lòng thêm sản phẩm trước khi thanh toán</p>
                <Link to="/shop" className="inline-block bg-primary text-white font-bold px-8 py-3 rounded-full">
                    Tiếp tục mua sắm
                </Link>
            </div>
        );
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmitInfo = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.phone || !formData.address || !formData.city) {
            setError('Vui lòng điền đầy đủ thông tin bắt buộc');
            return;
        }

        // Validate district and ward if location data is loaded and available
        if (provinces.length > 0 && !formData.city) {
            setError('Vui lòng chọn Tỉnh/Thành phố');
            return;
        }
        if (districts.length > 0 && !formData.district) {
            setError('Vui lòng chọn Quận/Huyện');
            return;
        }
        if (wards.length > 0 && !formData.ward) {
            setError('Vui lòng chọn Phường/Xã');
            return;
        }

        setError('');
        setStep(2);
    };

    const handlePayment = async () => {
        setIsProcessing(true);
        setError('');

        try {
            // Step 1: Create order
            const orderData = {
                items: items.map(item => ({ productId: item.product.id, quantity: item.quantity })),
                shippingAddress: formData,
                paymentMethod,
            };

            const { order } = await api.createOrder(orderData);

            // Step 2: Process payment based on method
            if (paymentMethod === 'VNPAY') {
                const result = await api.createVnpayPayment(order.id);
                if (result.payUrl) {
                    clearCart();
                    window.location.href = result.payUrl;
                    return;
                }
            } else if (paymentMethod === 'COD' || paymentMethod === 'BANK') {
                await api.confirmCodOrder(order.id);
                clearCart();
                navigate(`/order-success?orderId=${order.id}&method=${paymentMethod}`);
                return;
            }

            setError('Không thể tạo thanh toán. Vui lòng thử lại.');
        } catch (err: unknown) {
            const error = err as Error;
            setError(error.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="min-h-screen bg-paper">
            {/* Progress Bar */}
            <div className="max-w-[1200px] mx-auto px-6 pt-8">
                <div className="flex flex-col gap-3">
                    <div className="flex gap-6 justify-between items-center">
                        <p className="text-primary text-lg font-bold">
                            {step === 1 ? '1. Thông tin giao hàng' : '2. Thanh toán'}
                        </p>
                        <p className="text-primary/60 text-sm font-medium">Bước {step} trên 2</p>
                    </div>
                    <div className="rounded-full bg-primary/10 h-1.5 overflow-hidden">
                        <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${step * 50}%` }}></div>
                    </div>
                </div>
            </div>

            <main className="max-w-[1200px] mx-auto px-6 py-8">
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                        {error}
                    </div>
                )}

                <div className="flex flex-col lg:flex-row gap-12 items-start">
                    {/* Left Section */}
                    <div className="flex-1 flex flex-col gap-8">
                        {step === 1 ? (
                            <>
                                <div className="flex flex-col gap-2">
                                    <h1 className="text-primary text-3xl font-black tracking-tight">Chi tiết vận chuyển</h1>
                                    <p className="text-primary/60 text-base">Nhập thông tin để chúng tôi gửi đơn hàng đến sớm nhất.</p>
                                </div>

                                <form onSubmit={handleSubmitInfo} className="flex flex-col gap-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="flex flex-col gap-2">
                                            <label className="text-primary text-sm font-bold">Họ và tên *</label>
                                            <input
                                                name="name"
                                                value={formData.name}
                                                onChange={handleInputChange}
                                                required
                                                className="w-full rounded-2xl p-4 text-primary text-base placeholder:text-primary/30 h-14 bg-cream border border-transparent focus:border-primary focus:outline-none"
                                                placeholder="Nguyễn Văn A"
                                            />
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <label className="text-primary text-sm font-bold">Số điện thoại *</label>
                                            <input
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleInputChange}
                                                required
                                                className="w-full rounded-2xl p-4 text-primary text-base placeholder:text-primary/30 h-14 bg-cream border border-transparent focus:border-primary focus:outline-none"
                                                placeholder="090x xxx xxx"
                                                type="tel"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-4">
                                        <div className="flex flex-col gap-2">
                                            <label className="text-primary text-sm font-bold">Địa chỉ chi tiết *</label>
                                            <input
                                                name="address"
                                                value={formData.address}
                                                onChange={handleInputChange}
                                                required
                                                className="w-full rounded-2xl p-4 text-primary text-base placeholder:text-primary/30 h-14 bg-cream border border-transparent focus:border-primary focus:outline-none"
                                                placeholder="Số nhà, tên đường..."
                                            />
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div className="flex flex-col gap-2 relative">
                                                <label className="text-primary text-sm font-bold">Tỉnh / Thành *</label>
                                                <select
                                                    name="city"
                                                    value={formData.city}
                                                    onChange={handleInputChange}
                                                    required
                                                    className="w-full rounded-2xl p-4 text-primary text-base h-14 bg-cream border border-transparent focus:border-primary focus:outline-none appearance-none"
                                                    disabled={loadingLocations.provinces}
                                                >
                                                    <option value="">{loadingLocations.provinces ? 'Đang tải...' : 'Chọn tỉnh thành'}</option>
                                                    {provinces.map(p => (
                                                        <option key={p.code} value={p.name}>{p.name}</option>
                                                    ))}
                                                </select>
                                                {loadingLocations.provinces && (
                                                    <Loader2 className="w-4 h-4 animate-spin absolute right-4 bottom-5 text-primary/40" />
                                                )}
                                            </div>
                                            <div className="flex flex-col gap-2 relative">
                                                <label className="text-primary text-sm font-bold">Quận / Huyện</label>
                                                <select
                                                    name="district"
                                                    value={formData.district}
                                                    onChange={handleInputChange}
                                                    className="w-full rounded-2xl p-4 text-primary text-base h-14 bg-cream border border-transparent focus:border-primary focus:outline-none appearance-none"
                                                    disabled={!formData.city || loadingLocations.districts}
                                                >
                                                    <option value="">
                                                        {!formData.city ? 'Chọn tỉnh trước' : loadingLocations.districts ? 'Đang tải...' : 'Chọn quận huyện'}
                                                    </option>
                                                    {districts.map(d => (
                                                        <option key={d.code} value={d.name}>{d.name}</option>
                                                    ))}
                                                </select>
                                                {loadingLocations.districts && (
                                                    <Loader2 className="w-4 h-4 animate-spin absolute right-4 bottom-5 text-primary/40" />
                                                )}
                                            </div>
                                            <div className="flex flex-col gap-2 relative">
                                                <label className="text-primary text-sm font-bold">Phường / Xã</label>
                                                <select
                                                    name="ward"
                                                    value={formData.ward}
                                                    onChange={handleInputChange}
                                                    className="w-full rounded-2xl p-4 text-primary text-base h-14 bg-cream border border-transparent focus:border-primary focus:outline-none appearance-none"
                                                    disabled={!formData.district || loadingLocations.wards}
                                                >
                                                    <option value="">
                                                        {!formData.district ? 'Chọn huyện trước' : loadingLocations.wards ? 'Đang tải...' : 'Chọn phường xã'}
                                                    </option>
                                                    {wards.map(w => (
                                                        <option key={w.code} value={w.name}>{w.name}</option>
                                                    ))}
                                                </select>
                                                {loadingLocations.wards && (
                                                    <Loader2 className="w-4 h-4 animate-spin absolute right-4 bottom-5 text-primary/40" />
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-6">
                                        <Link to="/cart" className="flex items-center gap-2 text-primary/60 hover:text-primary transition-colors text-sm font-bold">
                                            <ArrowLeft className="w-4 h-4" /> Quay lại giỏ hàng
                                        </Link>
                                        <button type="submit" className="bg-primary text-white px-10 py-4 rounded-full font-bold text-lg hover:shadow-xl hover:scale-[1.02] transition-all w-full md:w-auto">
                                            Tiếp tục thanh toán
                                        </button>
                                    </div>
                                </form>
                            </>
                        ) : (
                            <>
                                <div className="flex flex-col gap-2">
                                    <h1 className="text-primary text-3xl font-black tracking-tight">Phương thức thanh toán</h1>
                                    <p className="text-primary/60 text-base">Chọn phương thức thanh toán phù hợp nhất.</p>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                                    {/* VNPAY */}
                                    <label className={`group relative flex flex-col items-center justify-center p-8 bg-white border-2 rounded-2xl shadow-sm cursor-pointer transition-all hover:shadow-lg hover:-translate-y-0.5 min-h-[160px] ${paymentMethod === 'VNPAY' ? 'border-primary ring-2 ring-primary/20 shadow-md' : 'border-stone-100'}`}>
                                        <input type="radio" name="payment" className="hidden" checked={paymentMethod === 'VNPAY'} onChange={() => setPaymentMethod('VNPAY')} />
                                        <div className={`w-16 h-16 mb-4 rounded-2xl flex items-center justify-center transition-all ${paymentMethod === 'VNPAY' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-primary/5 text-primary'}`}>
                                            <CreditCard className="w-8 h-8" />
                                        </div>
                                        <h3 className="font-bold text-lg mb-1.5 text-primary">VNPay</h3>
                                        <p className="text-[10px] uppercase tracking-wider font-bold text-primary/40 text-center">Thẻ & QR Code</p>
                                    </label>

                                    {/* COD */}
                                    <label className={`group relative flex flex-col items-center justify-center p-8 bg-white border-2 rounded-2xl shadow-sm cursor-pointer transition-all hover:shadow-lg hover:-translate-y-0.5 min-h-[160px] ${paymentMethod === 'COD' ? 'border-primary ring-2 ring-primary/20 shadow-md' : 'border-stone-100'}`}>
                                        <input type="radio" name="payment" className="hidden" checked={paymentMethod === 'COD'} onChange={() => setPaymentMethod('COD')} />
                                        <div className={`w-16 h-16 mb-4 rounded-2xl flex items-center justify-center transition-all ${paymentMethod === 'COD' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-primary/5 text-primary'}`}>
                                            <Truck className="w-8 h-8" />
                                        </div>
                                        <h3 className="font-bold text-lg mb-1.5 text-primary">COD</h3>
                                        <p className="text-[10px] uppercase tracking-wider font-bold text-primary/40 text-center">Khi nhận hàng</p>
                                    </label>

                                    {/* Bank Transfer */}
                                    <label className={`group relative flex flex-col items-center justify-center p-8 bg-white border-2 rounded-2xl shadow-sm cursor-pointer transition-all hover:shadow-lg hover:-translate-y-0.5 min-h-[160px] ${paymentMethod === 'BANK' ? 'border-primary ring-2 ring-primary/20 shadow-md' : 'border-stone-100'}`}>
                                        <input type="radio" name="payment" className="hidden" checked={paymentMethod === 'BANK'} onChange={() => setPaymentMethod('BANK')} />
                                        <div className={`w-16 h-16 mb-4 rounded-2xl flex items-center justify-center transition-all ${paymentMethod === 'BANK' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-primary/5 text-primary'}`}>
                                            <Landmark className="w-8 h-8" />
                                        </div>
                                        <h3 className="font-bold text-lg mb-1.5 text-primary">Chuyển khoản</h3>
                                        <p className="text-[10px] uppercase tracking-wider font-bold text-primary/40 text-center">Ngân hàng</p>
                                    </label>
                                </div>

                                {/* Payment Info */}
                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100">
                                    {paymentMethod === 'VNPAY' && (
                                        <p className="text-stone-600">Bạn sẽ được chuyển đến trang thanh toán VNPay. Hỗ trợ ATM nội địa, Visa/Mastercard và QR Code.</p>
                                    )}
                                    {paymentMethod === 'COD' && (
                                        <p className="text-stone-600">Thanh toán bằng tiền mặt khi nhận hàng. Vui lòng chuẩn bị đúng số tiền <strong>{formatPrice(finalTotal)}</strong>.</p>
                                    )}
                                    {paymentMethod === 'BANK' && (
                                        <div className="space-y-6">
                                            <p className="text-stone-600">Vui lòng chuyển khoản chính xác số tiền sau:</p>

                                            <div className="flex flex-col md:flex-row gap-8 items-center bg-primary/5 p-6 rounded-3xl border border-primary/10">
                                                {/* Details */}
                                                <div className="flex-1 w-full space-y-4">
                                                    <div className="flex justify-between items-center text-sm">
                                                        <span className="text-primary/60">Ngân hàng</span>
                                                        <span className="text-primary font-bold">{settings.payment.bankName}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center text-sm">
                                                        <span className="text-primary/60">Số tài khoản</span>
                                                        <span className="text-primary font-bold">{settings.payment.accountNumber}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center text-sm">
                                                        <span className="text-primary/60">Chủ tài khoản</span>
                                                        <span className="text-primary font-bold uppercase">{settings.payment.accountHolder}</span>
                                                    </div>
                                                    {settings.payment.branch && (
                                                        <div className="flex justify-between items-center text-sm">
                                                            <span className="text-primary/60">Chi nhánh</span>
                                                            <span className="text-primary font-bold">{settings.payment.branch}</span>
                                                        </div>
                                                    )}
                                                    <div className="flex justify-between items-center pt-3 border-t border-primary/10">
                                                        <span className="text-primary/60 font-bold">Số tiền</span>
                                                        <span className="text-primary text-xl font-black">{formatPrice(finalTotal)}</span>
                                                    </div>
                                                </div>

                                                {/* QR Code */}
                                                {settings.payment.qrCode && (
                                                    <div className="w-40 flex flex-col items-center gap-2">
                                                        <div className="w-full aspect-square bg-white p-2 rounded-2xl shadow-sm border border-primary/5 overflow-hidden">
                                                            <img src={settings.payment.qrCode.startsWith('http') ? settings.payment.qrCode : `${api.baseUrl}${settings.payment.qrCode}`} className="w-full h-full object-contain" alt="QR Code" />
                                                        </div>
                                                        <span className="text-[10px] font-bold text-primary/40 uppercase tracking-widest text-center">Quét mã QR để thanh toán</span>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="p-4 bg-white border border-dashed border-primary/30 rounded-2xl">
                                                <p className="text-xs text-primary/60 mb-1">Nội dung chuyển khoản:</p>
                                                <p className="font-bold text-primary text-lg">
                                                    {settings.payment.transferContent.replace('{orderId}', '(Mã đơn của bạn)')}
                                                </p>
                                            </div>
                                            <p className="text-[11px] text-primary/40 italic">Đơn hàng sẽ được xử lý ngay sau khi hệ thống ghi nhận giao dịch thành công.</p>
                                        </div>
                                    )}
                                </div>

                                <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-6">
                                    <button onClick={() => setStep(1)} className="flex items-center gap-2 text-primary/60 hover:text-primary transition-colors text-sm font-bold">
                                        <ArrowLeft className="w-4 h-4" /> Quay lại
                                    </button>
                                    <button
                                        onClick={handlePayment}
                                        disabled={isProcessing}
                                        className="bg-primary text-white px-10 py-4 rounded-full font-bold text-lg hover:shadow-xl hover:scale-[1.02] transition-all w-full md:w-auto disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {isProcessing ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin" /> Đang xử lý...
                                            </>
                                        ) : (
                                            <>
                                                Xác nhận thanh toán <ArrowRight className="w-5 h-5" />
                                            </>
                                        )}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Right Sidebar - Order Summary */}
                    <aside className="w-full lg:w-[380px]">
                        <div className="bg-cream rounded-2xl p-8 sticky top-24 shadow-sm">
                            <h3 className="text-primary text-xl font-extrabold mb-6">Đơn hàng của bạn</h3>

                            {/* Item List */}
                            <div className="flex flex-col gap-4 mb-6 border-b border-primary/10 pb-6 max-h-[300px] overflow-y-auto">
                                {items.map((item) => (
                                    <div key={item.product.id} className="flex gap-4">
                                        <div
                                            className="w-16 h-16 rounded-xl bg-white overflow-hidden flex-shrink-0 border border-primary/5 bg-cover bg-center"
                                            style={{ backgroundImage: `url('${item.product.image?.startsWith('http') ? item.product.image : `${api.baseUrl}${item.product.image}`}')` }}
                                        />
                                        <div className="flex flex-col justify-center gap-1">
                                            <p className="text-primary font-bold text-sm leading-snug">{item.product.name}</p>
                                            <p className="text-primary/50 text-xs">SL: {item.quantity}</p>
                                            <p className="text-primary font-extrabold text-sm">{formatPrice(item.product.price * item.quantity)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Price Breakdown */}
                            <div className="flex flex-col gap-3 mb-6">
                                <div className="flex justify-between items-center text-sm font-medium">
                                    <span className="text-primary/60">Tạm tính</span>
                                    <span className="text-primary">{formatPrice(totalPrice)}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm font-medium">
                                    <span className="text-primary/60">Phí vận chuyển</span>
                                    <span className="text-primary">{shippingFee === 0 ? 'Miễn phí' : formatPrice(shippingFee)}</span>
                                </div>
                            </div>

                            <div className="flex justify-between items-center pt-4 border-t border-primary/10">
                                <span className="text-primary font-bold">Tổng cộng</span>
                                <span className="text-primary text-2xl font-black">{formatPrice(finalTotal)}</span>
                            </div>

                            <div className="mt-6 p-4 bg-primary/5 rounded-xl flex items-start gap-3">
                                <ShieldCheck className="w-5 h-5 text-primary flex-shrink-0" />
                                <p className="text-[11px] text-primary/70 leading-relaxed uppercase tracking-wider font-bold">
                                    Mọi thanh toán đều được mã hóa an toàn. Chúng tôi ưu tiên trải nghiệm bình yên của bạn.
                                </p>
                            </div>
                        </div>
                    </aside>
                </div>
            </main>
        </div>
    );
};

export default Checkout;
