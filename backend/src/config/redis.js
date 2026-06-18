const Redis = require('ioredis');
const logger = require('../utils/logger');

let redisClient = null;
let redisAvailable = false;

const connectRedis = () => {
    try {
        redisClient = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
            maxRetriesPerRequest: 1,
            enableReadyCheck: true,
            lazyConnect: true,
            retryStrategy: (times) => {
                if (times > 2) {
                    // Stop reconnecting after 2 attempts — app works without Redis
                    logger.warn('Redis unavailable after 2 retries. Disabling cache (app continues without it).');
                    redisAvailable = false;
                    return null; // stop reconnecting
                }
                return Math.min(times * 500, 2000);
            },
            reconnectOnError: () => false, // don't reconnect on command errors
        });

        redisClient.on('connect', () => {
            redisAvailable = true;
            logger.info('Redis connected successfully.');
        });

        redisClient.on('error', (err) => {
            if (redisAvailable) {
                logger.warn(`Redis error (app continues without cache): ${err.message}`);
                redisAvailable = false;
            }
        });

        redisClient.on('close', () => {
            if (redisAvailable) {
                logger.warn('Redis connection closed.');
                redisAvailable = false;
            }
        });

        // Attempt initial connection (non-blocking)
        redisClient.connect().catch(() => {
            redisAvailable = false;
            logger.warn('Redis not available. App continues without cache.');
        });

        return redisClient;
    } catch (error) {
        logger.warn(`Redis init failed (app continues without cache): ${error.message}`);
        return null;
    }
};

// Safe get — returns null if Redis is unavailable
const cacheGet = async (key) => {
    try {
        if (!redisClient || !redisAvailable) return null;
        const value = await redisClient.get(key);
        return value ? JSON.parse(value) : null;
    } catch {
        redisAvailable = false;
        return null;
    }
};

// Safe set — silently skips if Redis is unavailable
const cacheSet = async (key, value, ttlSeconds = 300) => {
    try {
        if (!redisClient || !redisAvailable) return;
        await redisClient.setex(key, ttlSeconds, JSON.stringify(value));
    } catch {
        redisAvailable = false;
    }
};

// Safe delete
const cacheDel = async (key) => {
    try {
        if (!redisClient || !redisAvailable) return;
        await redisClient.del(key);
    } catch {
        redisAvailable = false;
    }
};

module.exports = { connectRedis, cacheGet, cacheSet, cacheDel };