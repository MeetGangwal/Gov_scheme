const client = require('prom-client');

// Collect default Node.js metrics (CPU, memory, event loop, etc.)
client.collectDefaultMetrics({ prefix: 'scheme_portal_' });

// ── Custom metrics ──────────────────────────────────────────────

// Count of HTTP requests by method, route, status
const httpRequestCounter = new client.Counter({
    name: 'scheme_portal_http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'route', 'status_code'],
});

// Histogram of HTTP response durations
const httpRequestDuration = new client.Histogram({
    name: 'scheme_portal_http_request_duration_seconds',
    help: 'Duration of HTTP requests in seconds',
    labelNames: ['method', 'route', 'status_code'],
    buckets: [0.01, 0.05, 0.1, 0.3, 0.5, 1, 2, 5],
});

// Count of eligibility checks
const eligibilityCheckCounter = new client.Counter({
    name: 'scheme_portal_eligibility_checks_total',
    help: 'Total number of eligibility checks performed',
});

// Count of schemes matched per request (gauge)
const schemesMatchedGauge = new client.Gauge({
    name: 'scheme_portal_schemes_matched_avg',
    help: 'Average number of schemes matched per eligibility check',
});

// Middleware that records metrics for every request
const metricsMiddleware = (req, res, next) => {
    const end = httpRequestDuration.startTimer();

    res.on('finish', () => {
        const route = req.route ? req.route.path : req.path;
        const labels = {
            method: req.method,
            route,
            status_code: res.statusCode,
        };
        httpRequestCounter.inc(labels);
        end(labels);
    });

    next();
};

// Expose /metrics endpoint handler
const metricsHandler = async (req, res) => {
    res.set('Content-Type', client.register.contentType);
    res.end(await client.register.metrics());
};

module.exports = {
    metricsMiddleware,
    metricsHandler,
    eligibilityCheckCounter,
    schemesMatchedGauge,
};