import { Router, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { authMiddleware, adminMiddleware } from '../middleware/auth';

const router = Router();
const SETTINGS_PATH = path.join(__dirname, '../config/settings.json');

// Helper to read settings
const readSettings = () => {
    try {
        if (!fs.existsSync(SETTINGS_PATH)) {
            return {};
        }
        return JSON.parse(fs.readFileSync(SETTINGS_PATH, 'utf8'));
    } catch (error) {
        console.error('Error reading settings:', error);
        return {};
    }
};

// Helper to write settings
const writeSettings = (settings: any) => {
    try {
        fs.writeFileSync(SETTINGS_PATH, JSON.stringify(settings, null, 2), 'utf8');
        return true;
    } catch (error) {
        console.error('Error writing settings:', error);
        return false;
    }
};

// GET /api/settings - Public (for branding, AI greeting, SEO)
router.get('/', async (req: Request, res: Response) => {
    const settings = readSettings();
    // Only return public-safe settings (don't expose sensitive info if any)
    res.json(settings);
});

// PATCH /api/settings - Admin only
router.patch('/', authMiddleware, adminMiddleware, async (req: Request, res: Response) => {
    try {
        const currentSettings = readSettings();
        const newSettings = { ...currentSettings, ...req.body };

        if (writeSettings(newSettings)) {
            res.json(newSettings);
        } else {
            res.status(500).json({ error: 'Failed to update settings' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

export default router;
