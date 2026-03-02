import crypto from 'crypto';
import { VNPay, ProductCode, VnpLocale } from 'vnpay';

// Payment Config
export const paymentConfig = {
    momo: {
        partnerCode: process.env.MOMO_PARTNER_CODE || '',
        accessKey: process.env.MOMO_ACCESS_KEY || '',
        secretKey: process.env.MOMO_SECRET_KEY || '',
        endpoint: process.env.MOMO_ENDPOINT || 'https://test-payment.momo.vn/v2/gateway/api/create',
    },
    vnpay: {
        tmnCode: process.env.VNPAY_TMN_CODE || '',
        hashSecret: process.env.VNPAY_HASH_SECRET || '',
        url: process.env.VNPAY_URL || 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html',
        returnUrl: process.env.VNPAY_RETURN_URL || 'http://localhost:3000/payment/vnpay/return',
    },
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
};

interface PaymentResult {
    success: boolean;
    payUrl?: string;
    orderId: string;
    message?: string;
    error?: string;
}

interface MomoResponse {
    resultCode: number;
    payUrl?: string;
    message?: string;
}

class PaymentService {
    private vnpay: VNPay | null = null;

    constructor() {
        if (paymentConfig.vnpay.tmnCode && paymentConfig.vnpay.hashSecret) {
            this.vnpay = new VNPay({
                tmnCode: paymentConfig.vnpay.tmnCode,
                secureSecret: paymentConfig.vnpay.hashSecret,
                vnpayHost: 'https://sandbox.vnpayment.vn',
                testMode: true,
            });
        }
    }

    // ============ MOMO PAYMENT ============
    async createMomoPayment(
        orderId: string,
        amount: number,
        orderInfo: string,
        ipnUrl: string,
        redirectUrl: string
    ): Promise<PaymentResult> {
        const { partnerCode, accessKey, secretKey, endpoint } = paymentConfig.momo;

        if (!partnerCode || !accessKey || !secretKey) {
            return { success: false, orderId, error: 'MoMo credentials not configured' };
        }

        const requestId = `${orderId}_${Date.now()}`;
        const requestType = 'captureWallet';
        const extraData = '';

        // Create signature
        const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestType}`;
        const signature = crypto.createHmac('sha256', secretKey).update(rawSignature).digest('hex');

        const requestBody = {
            partnerCode,
            accessKey,
            requestId,
            amount,
            orderId,
            orderInfo,
            redirectUrl,
            ipnUrl,
            extraData,
            requestType,
            signature,
            lang: 'vi',
        };

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody),
            });

            const data = await response.json() as MomoResponse;

            if (data.resultCode === 0) {
                return { success: true, payUrl: data.payUrl, orderId, message: data.message };
            } else {
                return { success: false, orderId, error: data.message || 'MoMo payment creation failed' };
            }
        } catch (error) {
            console.error('MoMo payment error:', error);
            return { success: false, orderId, error: 'Failed to connect to MoMo' };
        }
    }

    verifyMomoCallback(data: Record<string, string>): boolean {
        const { secretKey } = paymentConfig.momo;
        if (!secretKey) return false;

        const {
            accessKey, amount, extraData, message, orderId, orderInfo,
            orderType, partnerCode, payType, requestId, responseTime,
            resultCode, transId, signature
        } = data;

        const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&message=${message}&orderId=${orderId}&orderInfo=${orderInfo}&orderType=${orderType}&partnerCode=${partnerCode}&payType=${payType}&requestId=${requestId}&responseTime=${responseTime}&resultCode=${resultCode}&transId=${transId}`;
        const expectedSignature = crypto.createHmac('sha256', secretKey).update(rawSignature).digest('hex');

        return signature === expectedSignature;
    }

    // ============ VNPAY PAYMENT ============
    async createVnpayPayment(
        orderId: string,
        amount: number,
        orderInfo: string,
        ipAddress: string,
        returnUrl?: string
    ): Promise<PaymentResult> {
        if (!this.vnpay) {
            return { success: false, orderId, error: 'VNPay credentials not configured' };
        }

        try {
            const paymentUrl = this.vnpay.buildPaymentUrl({
                vnp_Amount: amount,
                vnp_IpAddr: ipAddress,
                vnp_TxnRef: orderId,
                vnp_OrderInfo: orderInfo,
                vnp_OrderType: ProductCode.Other,
                vnp_ReturnUrl: returnUrl || paymentConfig.vnpay.returnUrl,
                vnp_Locale: VnpLocale.VN,
            });

            return { success: true, payUrl: paymentUrl.toString(), orderId };
        } catch (error) {
            console.error('VNPay payment error:', error);
            return { success: false, orderId, error: 'Failed to create VNPay payment' };
        }
    }

    verifyVnpayReturn(query: Record<string, string>): { isValid: boolean; isSuccess: boolean; orderId: string } {
        if (!this.vnpay) {
            return { isValid: false, isSuccess: false, orderId: '' };
        }

        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const result = this.vnpay.verifyReturnUrl(query as any);
            return {
                isValid: result.isVerified,
                isSuccess: result.isSuccess,
                orderId: query.vnp_TxnRef || '',
            };
        } catch (error) {
            console.error('VNPay verify error:', error);
            return { isValid: false, isSuccess: false, orderId: '' };
        }
    }
}

export const paymentService = new PaymentService();
