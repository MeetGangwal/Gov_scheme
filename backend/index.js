require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const { connectDB } = require('./src/config/db');
const { connectRedis } = require('./src/config/redis');
const { metricsMiddleware } = require('./src/utils/metrics');
const logger = require('./src/utils/logger');
const errorHandler = require('./src/middleware/errorHandler');

// ── Route imports ─────────────────────────────────────────────
const authRoutes = require('./src/routes/authRoutes');
const schemeRoutes = require('./src/routes/schemeRoutes');
const healthRoutes = require('./src/routes/healthRoutes');

const app = express();

// ─────────────────────────────────────────────────────────────
// Security middleware (DevSecOps)
// ─────────────────────────────────────────────────────────────

// Sets secure HTTP headers: X-Content-Type-Options, X-Frame-Options,
// Strict-Transport-Security, X-XSS-Protection, etc.
app.use(helmet());

// CORS — only allow requests from your frontend origin
const allowedOrigins = [
    'http://localhost:3000',
    process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
    cors({
        origin: (origin, callback) => {
            // Allow requests with no origin (Postman, curl, server-to-server)
            if (!origin) return callback(null, true);
            if (allowedOrigins.includes(origin)) return callback(null, true);
            callback(new Error(`CORS: Origin ${origin} not allowed.`));
        },
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
    })
);

// Global rate limiter — 100 requests per 15 minutes per IP
const globalLimiter = rateLimit({
    windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
    max: Number(process.env.RATE_LIMIT_MAX) || 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Too many requests from this IP. Please try again after 15 minutes.',
    },
});
app.use('/api/', globalLimiter);

// Stricter rate limiter for auth routes — prevent brute force
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20,
    message: {
        success: false,
        message: 'Too many login attempts. Please try again after 15 minutes.',
    },
});
app.use('/api/auth/', authLimiter);

// ─────────────────────────────────────────────────────────────
// General middleware
// ─────────────────────────────────────────────────────────────

// Parse incoming JSON (max 10kb to prevent payload attacks)
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// HTTP request logging
if (process.env.NODE_ENV !== 'test') {
    app.use(morgan('combined', {
        stream: { write: (msg) => logger.info(msg.trim()) },
    }));
}

// Prometheus metrics collection middleware
app.use(metricsMiddleware);

// ─────────────────────────────────────────────────────────────
// Routes
// ─────────────────────────────────────────────────────────────

// Health + metrics (no /api prefix — for K8s probes and Prometheus)
app.use('/', healthRoutes);

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/schemes', schemeRoutes);

// Root route
app.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Government Scheme Eligibility Portal API',
        version: '1.0.0',
        docs: '/api/schemes',
    });
});

// 404 handler — catch unmatched routes
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.originalUrl} not found.`,
    });
});

// Global error handler (must be last)
app.use(errorHandler);

// ─────────────────────────────────────────────────────────────
// Start server
// ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

const startServer = async () => {
    // Connect to MongoDB Atlas
    await connectDB();

    // Connect to Redis (non-blocking — app works without it)
    connectRedis();

    const server = app.listen(PORT, () => {
        logger.info(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    });

    // ── Graceful shutdown ───────────────────────────────────────
    // Kubernetes sends SIGTERM before killing a pod.
    // We finish in-flight requests before closing.
    const gracefulShutdown = (signal) => {
        logger.info(`${signal} received. Starting graceful shutdown...`);
        server.close(async () => {
            logger.info('HTTP server closed.');
            const { disconnectDB } = require('./config/db');
            await disconnectDB();
            logger.info('Process exiting.');
            process.exit(0);
        });

        // Force exit if shutdown takes more than 10 seconds
        setTimeout(() => {
            logger.error('Graceful shutdown timed out. Forcing exit.');
            process.exit(1);
        }, 10000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason) => {
        logger.error(`Unhandled Rejection: ${reason}`);
        server.close(() => process.exit(1));
    });
};

// Only start the server if this file is run directly (not imported by tests)
if (require.main === module) {
    startServer();
}

module.exports = app;