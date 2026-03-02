import dotenv from 'dotenv';
dotenv.config();

export const config = {
    nodeEnv: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT || '3001', 10),
    databaseUrl: process.env.DATABASE_URL!,
    jwt: {
        secret: process.env.JWT_SECRET || 'fallback-secret-key',
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    },
    huggingface: {
        apiKey: process.env.HUGGINGFACE_API_KEY || '',
        primaryModel: process.env.AI_PRIMARY_MODEL || 'Qwen/Qwen2.5-7B-Instruct',
        fallbackModel: process.env.AI_FALLBACK_MODEL || 'Qwen/Qwen2.5-7B-Instruct',
    },
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
    rateLimit: {
        windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
        maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
    },
};
