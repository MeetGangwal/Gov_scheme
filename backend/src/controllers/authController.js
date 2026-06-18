const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendSuccess, sendError } = require('../utils/apiResponse');
const logger = require('../utils/logger');

// ── Generate JWT ──────────────────────────────────────────────
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    });
};

// ── @route   POST /api/auth/register ─────────────────────────
// ── @access  Public
const register = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return sendError(res, 409, 'An account with this email already exists.');
        }

        const user = await User.create({ name, email, password });
        const token = generateToken(user._id);

        logger.info(`New user registered: ${email}`);

        return sendSuccess(res, 201, 'Account created successfully.', {
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
    } catch (error) {
        next(error);
    }
};

// ── @route   POST /api/auth/login ─────────────────────────────
// ── @access  Public
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Fetch user including password (select: false on model)
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return sendError(res, 401, 'Invalid email or password.');
        }

        if (!user.isActive) {
            return sendError(res, 403, 'Your account has been deactivated. Contact admin.');
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return sendError(res, 401, 'Invalid email or password.');
        }

        const token = generateToken(user._id);
        logger.info(`User logged in: ${email}`);

        return sendSuccess(res, 200, 'Login successful.', {
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
    } catch (error) {
        next(error);
    }
};

// ── @route   GET /api/auth/me ─────────────────────────────────
// ── @access  Private
const getMe = async (req, res, next) => {
    try {
        return sendSuccess(res, 200, 'User profile fetched.', { user: req.user });
    } catch (error) {
        next(error);
    }
};

module.exports = { register, login, getMe };