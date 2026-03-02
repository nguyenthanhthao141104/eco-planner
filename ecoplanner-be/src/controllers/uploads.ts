import { Router, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { authMiddleware, adminMiddleware, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

const useCloudinary = !!(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET);

let storage: multer.StorageEngine;

if (useCloudinary) {
    const { v2: cloudinary } = require('cloudinary');
    const { CloudinaryStorage } = require('multer-storage-cloudinary');
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
    });
    storage = new CloudinaryStorage({
        cloudinary,
        params: async (_req: any, file: any) => ({
            folder: 'eco-planner/products',
            allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
            transformation: [{ width: 1200, quality: 'auto', fetch_format: 'auto' }],
            public_id: `${Date.now()}-${file.originalname.replace(/\.[^/.]+$/, '')}`,
        }),
    });
    console.log('📸 Upload: Cloudinary mode');
} else {
    const uploadsDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
    storage = multer.diskStorage({
        destination: (_req, _file, cb) => cb(null, uploadsDir),
        filename: (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
    });
    console.log('📁 Upload: Local disk mode');
}

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|webp|gif/;
        if (allowedTypes.test(file.originalname.toLowerCase()) && allowedTypes.test(file.mimetype)) {
            return cb(null, true);
        }
        cb(new Error('Chỉ chấp nhận file ảnh (jpg, png, webp, gif)!'));
    },
});

router.post('/', authMiddleware, adminMiddleware, upload.single('file'), (req: AuthenticatedRequest, res: Response) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'Không có file nào được upload' });
        const fileUrl = useCloudinary ? req.file.path : `/uploads/${req.file.filename}`;
        res.json({ url: fileUrl });
    } catch (error) {
        res.status(500).json({ error: 'Upload failed' });
    }
});

export default router;
