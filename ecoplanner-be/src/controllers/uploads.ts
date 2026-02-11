import { Router, Response } from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { authMiddleware, adminMiddleware, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure Cloudinary Storage
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
        return {
            folder: 'eco-planner/products',
            allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
            transformation: [{ width: 1200, quality: 'auto', fetch_format: 'auto' }],
            public_id: `${Date.now()}-${file.originalname.replace(/\.[^/.]+$/, '')}`,
        };
    },
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|webp|gif/;
        const extname = allowedTypes.test(file.originalname.toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (extname && mimetype) {
            return cb(null, true);
        }
        cb(new Error('Chỉ chấp nhận file ảnh (jpg, png, webp, gif)!'));
    },
});

// POST /api/upload
router.post('/', authMiddleware, adminMiddleware, upload.single('file'), (req: AuthenticatedRequest, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'Không có file nào được upload' });
        }

        // Cloudinary returns the full URL in req.file.path
        const fileUrl = req.file.path;
        res.json({ url: fileUrl });
    } catch (error) {
        res.status(500).json({ error: 'Upload failed' });
    }
});

export default router;
