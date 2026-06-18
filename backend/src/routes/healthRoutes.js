const express = require('express');
const mongoose = require('mongoose');
const { metricsHandler } = require('../utils/metrics');

const router = express.Router();

// ── GET /health
// Kubernetes liveness probe — is the process alive?
router.get('/health', (req, res) => {
    res.status(200).json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
    });
});

// ── GET /health/ready
// Kubernetes readiness probe — is the app ready to receive traffic?
// Checks MongoDB connection state
router.get('/health/ready', (req, res) => {
    const dbState = mongoose.connection.readyState;
    // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
    if (dbState !== 1) {
        return res.status(503).json({
            status: 'not ready',
            reason: 'Database not connected',
            db_state: dbState,
        });
    }
    return res.status(200).json({
        status: 'ready',
        db: 'connected',
        timestamp: new Date().toISOString(),
    });
});

// ── GET /metrics
// Prometheus scrape endpoint — used by Grafana dashboard
router.get('/metrics', metricsHandler);

module.exports = router;