const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendError } = require('../utils/apiResponse');
const logger = require('../utils/logger');

// ── Protect route: verify JWT token ──────────────────────────
const protect = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return sendError(res, 401, 'Access denied. No token provided.');
        }

        const token = authHeader.split(' ')[1];

        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (err) {
            if (err.name === 'TokenExpiredError') {
                return sendError(res, 401, 'Token has expired. Please log in again.');
            }
            return sendError(res, 401, 'Invalid token.');
        }

        const user = await User.findById(decoded.id).select('-password');
        if (!user) {
            return sendError(res, 401, 'User belonging to this token no longer exists.');
        }

        if (!user.isActive) {
            return sendError(res, 403, 'Your account has been deactivated.');
        }

        req.user = user;
        next();
    } catch (error) {
        logger.error(`Auth middleware error: ${error.message}`);
        return sendError(res, 500, 'Authentication error.');
    }
};

// ── Restrict route to specific roles ─────────────────────────
const restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return sendError(res, 403, 'You do not have permission to perform this action.');
        }
        next();
    };
};

module.exports = { protect, restrictTo };