import { Router, Request, Response } from 'express';
import prisma from '../prisma/client';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth';
import { paymentService, paymentConfig } from '../services/PaymentService';

const router = Router();

// POST /api/payment/momo - Create MoMo payment
router.post('/momo', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { orderId } = req.body;
        if (!orderId) return res.status(400).json({ error: 'Order ID required' });

        // Get order
        const order = await prisma.order.findFirst({
            where: { id: orderId, userId: req.user!.userId },
        });
        if (!order) return res.status(404).json({ error: 'Order not found' });

        const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
        const frontendUrl = paymentConfig.frontendUrl;

        const result = await paymentService.createMomoPayment(
            orderId,
            order.total,
            `Thanh toán đơn hàng #${orderId.slice(0, 8).toUpperCase()}`,
            `${backendUrl}/api/payment/momo/ipn`,
            `${frontendUrl}/payment/momo/return?orderId=${orderId}`
        );

        if (result.success) {
            res.json({ payUrl: result.payUrl, orderId });
        } else {
            res.status(400).json({ error: result.error });
        }
    } catch (error) {
        console.error('MoMo payment error:', error);
        res.status(500).json({ error: 'Failed to create MoMo payment' });
    }
});

// POST /api/payment/momo/ipn - MoMo IPN callback
router.post('/momo/ipn', async (req: Request, res: Response) => {
    try {
        const data = req.body;
        const isValid = paymentService.verifyMomoCallback(data);

        if (!isValid) {
            return res.status(400).json({ error: 'Invalid signature' });
        }

        const { orderId, resultCode } = data;

        if (resultCode === 0 || resultCode === '0') {
            // Payment successful
            await prisma.order.update({
                where: { id: orderId },
                data: { status: 'CONFIRMED' },
            });
        } else {
            // Payment failed
            await prisma.order.update({
                where: { id: orderId },
                data: { status: 'CANCELLED' },
            });
        }

        res.status(204).send();
    } catch (error) {
        console.error('MoMo IPN error:', error);
        res.status(500).json({ error: 'IPN processing failed' });
    }
});

// POST /api/payment/vnpay - Create VNPay payment
router.post('/vnpay', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { orderId } = req.body;
        if (!orderId) return res.status(400).json({ error: 'Order ID required' });

        // Get order
        const order = await prisma.order.findFirst({
            where: { id: orderId, userId: req.user!.userId },
        });
        if (!order) return res.status(404).json({ error: 'Order not found' });

        const ipAddress = req.ip || req.socket.remoteAddress || '127.0.0.1';
        // Use backend returnUrl for security - backend will verify and redirect to frontend
        // returnUrl is configured in VNPAY_RETURN_URL env var

        const result = await paymentService.createVnpayPayment(
            orderId,
            order.total,
            `Thanh toán đơn hàng #${orderId.slice(0, 8).toUpperCase()}`,
            ipAddress
            // returnUrl will use default from paymentConfig.vnpay.returnUrl
        );

        if (result.success) {
            res.json({ payUrl: result.payUrl, orderId });
        } else {
            res.status(400).json({ error: result.error });
        }
    } catch (error) {
        console.error('VNPay payment error:', error);
        res.status(500).json({ error: 'Failed to create VNPay payment' });
    }
});

// GET /api/payment/vnpay/return - VNPay return handler
// This endpoint receives callback from VNPay, verifies signature, updates order, then redirects to frontend
router.get('/vnpay/return', async (req: Request, res: Response) => {
    try {
        const query = req.query as Record<string, string>;
        const result = paymentService.verifyVnpayReturn(query);
        const frontendUrl = paymentConfig.frontendUrl;

        // Invalid signature - redirect to frontend with error
        if (!result.isValid) {
            return res.redirect(`${frontendUrl}/payment/vnpay/return?success=false&orderId=${result.orderId}&error=invalid_signature`);
        }

        // Payment successful
        if (result.isSuccess) {
            await prisma.order.update({
                where: { id: result.orderId },
                data: { status: 'CONFIRMED' },
            });
            return res.redirect(`${frontendUrl}/payment/vnpay/return?success=true&orderId=${result.orderId}`);
        } else {
            // Payment failed
            await prisma.order.update({
                where: { id: result.orderId },
                data: { status: 'CANCELLED' },
            });
            return res.redirect(`${frontendUrl}/payment/vnpay/return?success=false&orderId=${result.orderId}`);
        }
    } catch (error) {
        console.error('VNPay return error:', error);
        const frontendUrl = paymentConfig.frontendUrl;
        return res.redirect(`${frontendUrl}/payment/vnpay/return?success=false&error=server_error`);
    }
});

// POST /api/payment/cod - COD confirmation (just marks order as pending)
router.post('/cod', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { orderId } = req.body;
        if (!orderId) return res.status(400).json({ error: 'Order ID required' });

        const order = await prisma.order.findFirst({
            where: { id: orderId, userId: req.user!.userId },
        });
        if (!order) return res.status(404).json({ error: 'Order not found' });

        // COD orders remain PENDING until delivered
        res.json({ success: true, orderId, message: 'COD order confirmed' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to confirm COD order' });
    }
});

export default router;
