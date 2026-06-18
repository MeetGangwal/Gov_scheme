const express = require('express');
const { body, param, query } = require('express-validator');
const {
    getAllSchemes,
    getSchemeById,
    checkEligibility,
    searchSchemes,
    aiAssist,
    createScheme,
    updateScheme,
    deleteScheme,
} = require('../controllers/schemeController');
const { protect, restrictTo } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

// ── Public routes ─────────────────────────────────────────────

// GET /api/schemes
router.get('/', getAllSchemes);

// GET /api/schemes/search?q=
router.get(
    '/search',
    [query('q').notEmpty().withMessage('Search query is required.')],
    validate,
    searchSchemes
);

// POST /api/schemes/check  — eligibility engine
router.post(
    '/check',
    [
        body('age')
            .isInt({ min: 0, max: 120 })
            .withMessage('Age must be a number between 0 and 120.'),
        body('gender')
            .isIn(['male', 'female', 'transgender', 'all'])
            .withMessage('Gender must be male, female, transgender, or all.'),
        body('caste')
            .isIn(['general', 'obc', 'sc', 'st', 'nt', 'vjnt', 'all'])
            .withMessage('Invalid caste value.'),
        body('annual_income')
            .optional()
            .isInt({ min: 0 })
            .withMessage('Annual income must be a non-negative number.'),
        body('bpl').optional().isBoolean().withMessage('BPL must be true or false.'),
        body('disability').optional().isBoolean().withMessage('Disability must be true or false.'),
        body('categories')
            .optional()
            .isArray()
            .withMessage('Categories must be an array.'),
    ],
    validate,
    checkEligibility
);

// POST /api/schemes/ai-assist — Gemini-powered natural language query
router.post(
    '/ai-assist',
    [
        body('query')
            .trim()
            .isLength({ min: 5 })
            .withMessage('Query must be at least 5 characters.'),
        body('lang').optional().isIn(['en', 'mr', 'hi']).withMessage('Language must be en, mr, or hi.'),
    ],
    validate,
    aiAssist
);

// GET /api/schemes/:id
router.get(
    '/:id',
    [param('id').isMongoId().withMessage('Invalid scheme ID.')],
    validate,
    getSchemeById
);

// ── Admin-only routes (protect + admin role required) ─────────

// POST /api/schemes (admin)
router.post(
    '/',
    protect,
    restrictTo('admin'),
    [
        body('name_en').trim().notEmpty().withMessage('English name is required.'),
        body('ministry').trim().notEmpty().withMessage('Ministry is required.'),
        body('category').isArray({ min: 1 }).withMessage('At least one category is required.'),
        body('benefit_description').trim().notEmpty().withMessage('Benefit description is required.'),
    ],
    validate,
    createScheme
);

// PUT /api/schemes/:id (admin)
router.put(
    '/:id',
    protect,
    restrictTo('admin'),
    [param('id').isMongoId().withMessage('Invalid scheme ID.')],
    validate,
    updateScheme
);

// DELETE /api/schemes/:id (admin)
router.delete(
    '/:id',
    protect,
    restrictTo('admin'),
    [param('id').isMongoId().withMessage('Invalid scheme ID.')],
    validate,
    deleteScheme
);

module.exports = router;