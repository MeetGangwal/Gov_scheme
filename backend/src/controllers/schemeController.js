const { GoogleGenerativeAI } = require('@google/generative-ai');
const Scheme = require('../models/Scheme');
const { sendSuccess, sendError } = require('../utils/apiResponse');
const { cacheGet, cacheSet, cacheDel } = require('../config/redis');
const { eligibilityCheckCounter, schemesMatchedGauge } = require('../utils/metrics');
const logger = require('../utils/logger');

// Gemini client — initialised lazily so missing key doesn't crash startup
let geminiModel = null;
const getGeminiModel = () => {
    if (!geminiModel && process.env.GEMINI_API_KEY) {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        geminiModel = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    }
    return geminiModel;
};

// ─────────────────────────────────────────────────────────────
// GET /api/schemes
// Returns all active schemes with optional category filter
// ─────────────────────────────────────────────────────────────
const getAllSchemes = async (req, res, next) => {
    try {
        const { category, level, page = 1, limit = 20 } = req.query;
        const cacheKey = `schemes:all:${category || 'all'}:${level || 'all'}:${page}`;

        // Check cache first
        const cached = await cacheGet(cacheKey);
        if (cached) {
            return sendSuccess(res, 200, 'Schemes fetched (cache).', cached);
        }

        const filter = { active: true };
        if (category) filter.category = { $in: [category] };
        if (level) filter.level = level;

        const skip = (Number(page) - 1) * Number(limit);
        const [schemes, total] = await Promise.all([
            Scheme.find(filter)
                .select('-embedding_text -__v')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(Number(limit))
                .lean(),
            Scheme.countDocuments(filter),
        ]);

        const payload = {
            schemes,
            pagination: {
                total,
                page: Number(page),
                limit: Number(limit),
                totalPages: Math.ceil(total / Number(limit)),
            },
        };

        await cacheSet(cacheKey, payload, 600); // Cache 10 minutes
        return sendSuccess(res, 200, 'Schemes fetched.', payload);
    } catch (error) {
        next(error);
    }
};

// ─────────────────────────────────────────────────────────────
// GET /api/schemes/:id
// Returns a single scheme by ID
// ─────────────────────────────────────────────────────────────
const getSchemeById = async (req, res, next) => {
    try {
        const cacheKey = `scheme:${req.params.id}`;
        const cached = await cacheGet(cacheKey);
        if (cached) return sendSuccess(res, 200, 'Scheme fetched (cache).', { scheme: cached });

        const scheme = await Scheme.findById(req.params.id).select('-embedding_text -__v').lean();
        if (!scheme) return sendError(res, 404, 'Scheme not found.');

        await cacheSet(cacheKey, scheme, 600);
        return sendSuccess(res, 200, 'Scheme fetched.', { scheme });
    } catch (error) {
        next(error);
    }
};

// ─────────────────────────────────────────────────────────────
// POST /api/schemes/check
// Core eligibility engine — matches user profile to schemes
// ─────────────────────────────────────────────────────────────
const checkEligibility = async (req, res, next) => {
    try {
        const {
            age,
            gender,
            annual_income,
            caste,
            state,
            bpl,
            marital_status,
            disability,
            categories,
        } = req.body;

        // Build cache key from profile
        const profileKey = `eligibility:${age}:${gender}:${annual_income}:${caste}:${bpl}:${marital_status}:${disability}:${(categories || []).sort().join('-')}`;
        const cached = await cacheGet(profileKey);
        if (cached) {
            eligibilityCheckCounter.inc();
            return sendSuccess(res, 200, 'Eligible schemes fetched (cache).', cached);
        }

        // ── Build MongoDB query ───────────────────────────────
        const query = {
            active: true,
            'eligibility.age_min': { $lte: Number(age) },
            'eligibility.age_max': { $gte: Number(age) },
            'eligibility.gender': { $in: [gender, 'all'] },
            'eligibility.caste': { $in: [caste, 'all'] },
            'eligibility.marital_status': { $in: [marital_status || 'any', 'any'] },
        };

        // Income filter — only apply if scheme has an income limit set
        if (annual_income !== undefined && annual_income !== null) {
            query.$or = [
                { 'eligibility.income_limit_annual': 0 },
                { 'eligibility.income_limit_annual': { $gte: Number(annual_income) } },
            ];
        }

        // BPL filter
        if (bpl === false) {
            query['eligibility.bpl_required'] = false;
        }

        // Disability filter
        if (!disability) {
            query['eligibility.disability_required'] = false;
        }

        // Category filter (user selects what they need help with)
        if (categories && categories.length > 0) {
            query.category = { $in: categories };
        }

        const schemes = await Scheme.find(query)
            .select('-embedding_text -__v')
            .sort({ createdAt: -1 })
            .lean();

        // Track metrics
        eligibilityCheckCounter.inc();
        schemesMatchedGauge.set(schemes.length);

        const payload = {
            matched_count: schemes.length,
            schemes,
            profile_used: { age, gender, annual_income, caste, bpl, marital_status, disability, categories },
        };

        await cacheSet(profileKey, payload, 300); // Cache 5 minutes
        logger.info(`Eligibility check: ${schemes.length} schemes matched for profile age=${age} caste=${caste}`);
        return sendSuccess(res, 200, 'Eligible schemes fetched.', payload);
    } catch (error) {
        next(error);
    }
};

// ─────────────────────────────────────────────────────────────
// GET /api/schemes/search?q=
// Full-text + AI-powered semantic search
// ─────────────────────────────────────────────────────────────
const searchSchemes = async (req, res, next) => {
    try {
        const { q, lang = 'en' } = req.query;
        if (!q || q.trim().length < 2) {
            return sendError(res, 400, 'Search query must be at least 2 characters.');
        }

        const cacheKey = `search:${q.toLowerCase().trim()}:${lang}`;
        const cached = await cacheGet(cacheKey);
        if (cached) return sendSuccess(res, 200, 'Search results (cache).', cached);

        let searchQuery = q.trim();

        // ── If Gemini is available and query is in Marathi/Hindi, translate first ──
        const model = getGeminiModel();
        if (model && lang !== 'en') {
            try {
                const prompt = `Translate the following Marathi or Hindi text to English. Return ONLY the translation, nothing else: "${searchQuery}"`;
                const result = await model.generateContent(prompt);
                const translated = result.response.text().trim();
                if (translated) searchQuery = translated;
                logger.info(`AI translated query: "${q}" → "${searchQuery}"`);
            } catch (aiErr) {
                logger.warn(`Gemini translation failed, using original query: ${aiErr.message}`);
            }
        }

        // ── MongoDB full-text search ──────────────────────────
        let schemes = [];
        try {
            schemes = await Scheme.find(
                { $text: { $search: searchQuery }, active: true },
                { score: { $meta: 'textScore' } }
            )
                .select('-embedding_text -__v')
                .sort({ score: { $meta: 'textScore' } })
                .limit(15)
                .lean();
        } catch (textSearchErr) {
            logger.warn(`Text search failed, falling back to regex: ${textSearchErr.message}`);
        }

        // ── Regex fallback if text search returns no results ──
        if (schemes.length === 0) {
            const regex = new RegExp(searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
            schemes = await Scheme.find({
                active: true,
                $or: [
                    { name_en: regex },
                    { name_mr: regex },
                    { name_hi: regex },
                    { benefit_description: regex },
                    { category: regex },
                ],
            })
                .select('-embedding_text -__v')
                .limit(15)
                .lean();
        }

        const payload = { count: schemes.length, schemes, query_used: searchQuery };
        await cacheSet(cacheKey, payload, 300);
        return sendSuccess(res, 200, 'Search results.', payload);
    } catch (error) {
        next(error);
    }
};

// ─────────────────────────────────────────────────────────────
// POST /api/schemes/ai-assist
// Natural language query via Gemini — extracts profile and checks eligibility
// ─────────────────────────────────────────────────────────────
const aiAssist = async (req, res, next) => {
    try {
        const { query, lang = 'en' } = req.body;
        if (!query || query.trim().length < 5) {
            return sendError(res, 400, 'Please provide a more detailed query.');
        }

        const model = getGeminiModel();
        if (!model) {
            return sendError(res, 503, 'AI service is not configured. Contact admin.');
        }

        const prompt = `
You are an assistant helping Indian citizens find government welfare schemes.
Extract structured eligibility information from the following user query (which may be in English, Marathi, or Hindi).

User query: "${query}"

Respond ONLY with a valid JSON object in this exact format — no markdown, no explanation:
{
  "age": <number or null>,
  "gender": "<male|female|transgender|all or null>",
  "annual_income": <number in INR or null>,
  "caste": "<general|obc|sc|st|nt|vjnt|all or null>",
  "bpl": <true|false|null>,
  "marital_status": "<single|married|widow|divorced|any or null>",
  "disability": <true|false|null>,
  "categories": [<array of: health|education|agriculture|housing|employment|women|finance|pension|disability|minority|tribal|child|elderly|other>],
  "summary": "<one sentence in English summarising what the user needs>"
}
`.trim();

        let extractedProfile;
        try {
            const result = await model.generateContent(prompt);
            const rawText = result.response.text().trim();
            // Strip markdown code fences if present
            const cleanJson = rawText.replace(/```json|```/g, '').trim();
            extractedProfile = JSON.parse(cleanJson);
        } catch (aiErr) {
            logger.error(`Gemini extraction failed: ${aiErr.message}`);
            return sendError(res, 502, 'AI could not understand the query. Please try again or use the form.');
        }

        // Use the extracted profile to run the eligibility engine
        if (!extractedProfile.age) {
            return sendSuccess(res, 200, 'Profile extracted — age missing, showing general schemes.', {
                extracted_profile: extractedProfile,
                schemes: [],
                message: 'Please provide your age for better results.',
            });
        }

        // Build query from extracted profile (same logic as checkEligibility)
        const matchQuery = {
            active: true,
            'eligibility.age_min': { $lte: Number(extractedProfile.age) },
            'eligibility.age_max': { $gte: Number(extractedProfile.age) },
        };

        if (extractedProfile.gender && extractedProfile.gender !== 'all') {
            matchQuery['eligibility.gender'] = { $in: [extractedProfile.gender, 'all'] };
        }
        if (extractedProfile.caste && extractedProfile.caste !== 'all') {
            matchQuery['eligibility.caste'] = { $in: [extractedProfile.caste, 'all'] };
        }
        if (extractedProfile.categories && extractedProfile.categories.length > 0) {
            matchQuery.category = { $in: extractedProfile.categories };
        }

        const schemes = await Scheme.find(matchQuery)
            .select('-embedding_text -__v')
            .limit(15)
            .lean();

        eligibilityCheckCounter.inc();
        logger.info(`AI assist: "${query}" → ${schemes.length} schemes found`);

        return sendSuccess(res, 200, 'AI-powered scheme matches found.', {
            extracted_profile: extractedProfile,
            matched_count: schemes.length,
            schemes,
        });
    } catch (error) {
        next(error);
    }
};

// ─────────────────────────────────────────────────────────────
// POST /api/admin/schemes — Admin: create scheme
// ─────────────────────────────────────────────────────────────
const createScheme = async (req, res, next) => {
    try {
        const scheme = await Scheme.create(req.body);
        // Invalidate all schemes cache
        await cacheDel('schemes:all:all:all:1');
        logger.info(`New scheme created: ${scheme.name_en} by admin ${req.user.email}`);
        return sendSuccess(res, 201, 'Scheme created successfully.', { scheme });
    } catch (error) {
        next(error);
    }
};

// ─────────────────────────────────────────────────────────────
// PUT /api/admin/schemes/:id — Admin: update scheme
// ─────────────────────────────────────────────────────────────
const updateScheme = async (req, res, next) => {
    try {
        const scheme = await Scheme.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        }).select('-embedding_text -__v');

        if (!scheme) return sendError(res, 404, 'Scheme not found.');

        await cacheDel(`scheme:${req.params.id}`);
        logger.info(`Scheme updated: ${scheme.name_en} by admin ${req.user.email}`);
        return sendSuccess(res, 200, 'Scheme updated successfully.', { scheme });
    } catch (error) {
        next(error);
    }
};

// ─────────────────────────────────────────────────────────────
// DELETE /api/admin/schemes/:id — Admin: soft-delete (sets active: false)
// ─────────────────────────────────────────────────────────────
const deleteScheme = async (req, res, next) => {
    try {
        const scheme = await Scheme.findByIdAndUpdate(
            req.params.id,
            { active: false },
            { new: true }
        );
        if (!scheme) return sendError(res, 404, 'Scheme not found.');

        await cacheDel(`scheme:${req.params.id}`);
        logger.info(`Scheme soft-deleted: ${scheme.name_en} by admin ${req.user.email}`);
        return sendSuccess(res, 200, 'Scheme removed successfully.');
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAllSchemes,
    getSchemeById,
    checkEligibility,
    searchSchemes,
    aiAssist,
    createScheme,
    updateScheme,
    deleteScheme,
};