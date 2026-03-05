import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2, Home, ShoppingBag } from 'lucide-react';
import { api } from '../services/api';

const PaymentReturn: React.FC = () => {
    const [searchParams] = useSearchParams();
    const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading');
    const [orderId, setOrderId] = useState('');

    useEffect(() => {
        const verifyPayment = async () => {
            // Backend redirect with success parameter (VNPay)
            const success = searchParams.get('success');
            const orderId = searchParams.get('orderId');
            const method = searchParams.get('method');

            if (success !== null) {
                // VNPay/MoMo return from backend
                setOrderId(orderId || '');
                setStatus(success === 'true' ? 'success' : 'failed');
            } else if (method && orderId) {
                // COD/Bank method (direct from frontend)
                setOrderId(orderId);
                setStatus('success');
            } else {
                setStatus('failed');
            }
        };

        verifyPayment();
    }, [searchParams]);

    if (status === 'loading') {
        return (
            <div className="min-h-[80vh] flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
                    <p className="text-charcoal/60">Đang xác nhận thanh toán...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
            <div className="max-w-lg w-full text-center">
                {status === 'success' ? (
                    <>
                        <div className="relative mb-8">
                            <div className="w-32 h-32 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                                <CheckCircle className="w-16 h-16 text-green-600" />
                            </div>
                        </div>
                        <h1 className="font-display text-3xl font-bold text-charcoal mb-4">
                            Thanh toán thành công! 🎉
                        </h1>
                        <p className="text-charcoal/60 mb-2">
                            Đơn hàng của bạn đã được xác nhận.
                        </p>
                        {orderId && (
                            <p className="text-primary font-bold mb-8">
                                Mã đơn: #{orderId.slice(0, 8).toUpperCase()}
                            </p>
                        )}
                    </>
                ) : (
                    <>
                        <div className="relative mb-8">
                            <div className="w-32 h-32 mx-auto bg-red-100 rounded-full flex items-center justify-center">
                                <XCircle className="w-16 h-16 text-red-600" />
                            </div>
                        </div>
                        <h1 className="font-display text-3xl font-bold text-charcoal mb-4">
                            Thanh toán thất bại
                        </h1>
                        <p className="text-charcoal/60 mb-8">
                            Giao dịch không thành công. Vui lòng thử lại.
                        </p>
                    </>
                )}

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
            </div>
        </div>
    );
};

export default PaymentReturn;
