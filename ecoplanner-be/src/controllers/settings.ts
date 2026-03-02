import { Router, Request, Response } from 'express';
import prisma from '../prisma/client';
import { authMiddleware, adminMiddleware } from '../middleware/auth';

const router = Router();
const SETTINGS_KEY = 'system_config';

const DEFAULT_SETTINGS = {
    branding: {
        facebook: 'https://www.facebook.com/mede',
        instagram: 'https://www.instagram.com/mede',
        hotline: '0909090909'
    },
    ai: {
        greeting: 'Xin chào! Mình là MEDE-Assistant 🌿. Mình có thể giúp gì cho bạn hôm nay?'
    },
    payment: {
        bankName: '',
        accountNumber: '',
        accountHolder: '',
        branch: '',
        qrCode: '',
        transferContent: 'THANH TOAN DON HANG CHO MEDE'
    },
    seo: {
        metaDescription: 'MEDE - Tiệm văn phòng phẩm xanh bền vững'
    }
};

// Helper to read settings
const readSettings = async () => {
    try {
        const record = await prisma.systemSetting.findUnique({
            where: { key: SETTINGS_KEY }
        });

        if (!record) {
            return DEFAULT_SETTINGS;
        }

        // Deep merge with defaults to ensure all fields exist
        return {
            ...DEFAULT_SETTINGS,
            ...(record.value as any),
            branding: { ...DEFAULT_SETTINGS.branding, ...(record.value as any).branding },
            ai: { ...DEFAULT_SETTINGS.ai, ...(record.value as any).ai },
            payment: { ...DEFAULT_SETTINGS.payment, ...(record.value as any).payment },
            seo: { ...DEFAULT_SETTINGS.seo, ...(record.value as any).seo }
        };
    } catch (error) {
        console.error('Error reading settings from DB:', error);
        return DEFAULT_SETTINGS;
    }
};

// Helper to write settings
const writeSettings = async (settings: any) => {
    try {
        await prisma.systemSetting.upsert({
            where: { key: SETTINGS_KEY },
            update: { value: settings },
            create: { key: SETTINGS_KEY, value: settings }
        });
        return true;
    } catch (error) {
        console.error('Error writing settings to DB:', error);
        return false;
    }
};

// GET /api/settings - Public
router.get('/', async (req: Request, res: Response) => {
    const settings = await readSettings();
    res.json(settings);
});

// PATCH /api/settings - Admin only
router.patch('/', authMiddleware, adminMiddleware, async (req: Request, res: Response) => {
    try {
        const currentSettings = await readSettings();
        const newSettings = {
            ...currentSettings,
            ...req.body,
            branding: { ...currentSettings.branding, ...req.body.branding },
            ai: { ...currentSettings.ai, ...req.body.ai },
            payment: { ...currentSettings.payment, ...req.body.payment },
            seo: { ...currentSettings.seo, ...req.body.seo }
        };

        if (await writeSettings(newSettings)) {
            res.json(newSettings);
        } else {
            res.status(500).json({ error: 'Failed to update settings' });
        }
    } catch (error) {
        console.error('Update settings error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

export default router;
