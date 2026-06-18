const mongoose = require('mongoose');

const schemeSchema = new mongoose.Schema(
    {
        // ── Names in 3 languages ──────────────────────────────
        name_en: {
            type: String,
            required: [true, 'English name is required'],
            trim: true,
        },
        name_mr: {
            type: String,
            trim: true,
            default: '',
        },
        name_hi: {
            type: String,
            trim: true,
            default: '',
        },

        // ── Classification ───────────────────────────────────
        ministry: {
            type: String,
            required: [true, 'Ministry/Department is required'],
            trim: true,
        },
        level: {
            type: String,
            enum: ['central', 'state', 'both'],
            default: 'state',
        },
        category: {
            type: [String],
            enum: [
                'health',
                'education',
                'agriculture',
                'housing',
                'employment',
                'women',
                'finance',
                'pension',
                'disability',
                'minority',
                'tribal',
                'child',
                'elderly',
                'other',
            ],
            required: [true, 'At least one category is required'],
        },

        // ── Eligibility criteria ─────────────────────────────
        eligibility: {
            age_min: { type: Number, default: 0 },
            age_max: { type: Number, default: 120 },

            gender: {
                type: String,
                enum: ['male', 'female', 'transgender', 'all'],
                default: 'all',
            },

            // Annual income limit in INR (0 = no limit)
            income_limit_annual: { type: Number, default: 0 },

            caste: {
                type: [String],
                enum: ['general', 'obc', 'sc', 'st', 'nt', 'vjnt', 'all'],
                default: ['all'],
            },

            bpl_required: { type: Boolean, default: false },

            marital_status: {
                type: [String],
                enum: ['single', 'married', 'widow', 'divorced', 'any'],
                default: ['any'],
            },

            residence: {
                type: String,
                enum: ['maharashtra', 'india', 'all'],
                default: 'maharashtra',
            },

            // Empty array = available across all districts
            districts: {
                type: [String],
                default: [],
            },

            // Specific occupations targeted (empty = all)
            occupation: {
                type: [String],
                default: [],
            },

            disability_required: { type: Boolean, default: false },

            education_required: {
                type: String,
                default: 'none', // none / primary / secondary / graduate / postgraduate
            },
        },

        // ── Scheme details ───────────────────────────────────
        benefit_description: {
            type: String,
            required: [true, 'Benefit description is required'],
            trim: true,
        },
        benefit_amount: {
            type: String,
            default: '',
        },
        documents_required: {
            type: [String],
            default: [],
        },
        apply_link: {
            type: String,
            trim: true,
            default: '',
        },
        apply_offline: {
            type: String,
            default: '',
        },
        deadline: {
            type: Date,
            default: null,
        },

        // ── Status ───────────────────────────────────────────
        active: {
            type: Boolean,
            default: true,
        },

        // ── For AI semantic search (set by ai-service) ────────
        embedding_text: {
            type: String,
            default: '',
        },
    },
    {
        timestamps: true,
    }
);

// ── Indexes for fast eligibility queries ──────────────────
schemeSchema.index({ active: 1 });
schemeSchema.index({ category: 1 });
schemeSchema.index({ 'eligibility.gender': 1 });
schemeSchema.index({ 'eligibility.caste': 1 });
schemeSchema.index({ 'eligibility.income_limit_annual': 1 });
schemeSchema.index({ name_en: 'text', benefit_description: 'text', name_mr: 'text' });

module.exports = mongoose.model('Scheme', schemeSchema);