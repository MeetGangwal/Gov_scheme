import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, ExternalLink, FileText, Building2, CheckCircle2, BadgeIndianRupee, MapPin, Users } from 'lucide-react'
import apiClient from '@/lib/apiClient.js'
import PageSpinner from '@/components/ui/PageSpinner.jsx'
import { CATEGORY_COLORS, cn } from '@/lib/helpers.js'

function InfoRow({ icon: Icon, label, value }) {
    return (
        <div className="flex items-start gap-3 py-3 border-b border-slate-50 last:border-0">
            <div className="w-8 h-8 rounded-lg bg-saffron-50 flex items-center justify-center shrink-0 mt-0.5">
                <Icon size={13} className="text-saffron-600" />
            </div>
            <div>
                <p className="text-slate-400 text-xs font-body mb-0.5">{label}</p>
                <p className="text-slate-800 text-sm font-body font-medium">{value}</p>
            </div>
        </div>
    )
}

export default function SchemeDetail() {
    const { id } = useParams()
    const [scheme, setScheme] = useState(null)
    const [loading, setLoading] = useState(true)
    const [notFound, setNotFound] = useState(false)

    useEffect(() => {
        if (!id) return
        apiClient.get(`/api/schemes/${id}`)
            .then(res => setScheme(res.data.data.scheme))
            .catch(() => setNotFound(true))
            .finally(() => setLoading(false))
    }, [id])

    if (loading) return <div className="pt-24"><PageSpinner text="Loading scheme details..." /></div>

    if (notFound || !scheme) {
        return (
            <div className="min-h-screen bg-cream flex items-center justify-center">
                <div className="text-center">
                    <div className="text-5xl mb-4">😕</div>
                    <h2 className="font-display font-bold text-2xl text-slate-900 mb-2">Scheme not found</h2>
                    <Link to="/schemes" className="text-saffron-500 font-body hover:underline">Back to all schemes</Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-cream pt-24 pb-16">
            <div className="max-w-5xl mx-auto px-4 sm:px-6">
                <Link to="/schemes" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-800 text-sm font-body mb-6 transition-colors">
                    <ArrowLeft size={14} /> All Schemes
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Left */}
                    <div className="lg:col-span-2 space-y-5">

                        {/* Header card */}
                        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-2xl shadow-card overflow-hidden">
                            <div className="h-2 bg-gradient-saffron" />
                            <div className="p-6">
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {scheme.category.map(cat => (
                                        <span key={cat} className={cn('text-xs font-display font-semibold px-3 py-1 rounded-full capitalize', CATEGORY_COLORS[cat] || 'bg-gray-100 text-gray-600')}>
                                            {cat}
                                        </span>
                                    ))}
                                    <span className={cn('text-xs font-display font-semibold px-3 py-1 rounded-full',
                                        scheme.level === 'central' ? 'bg-slate-100 text-slate-700' : 'bg-saffron-50 text-saffron-700')}>
                                        {scheme.level === 'central' ? 'Central Govt' : 'Maharashtra'}
                                    </span>
                                </div>
                                <h1 className="font-display font-bold text-2xl sm:text-3xl text-slate-900 mb-2 leading-snug">{scheme.name_en}</h1>
                                {scheme.name_mr && <p className="text-slate-500 font-body text-base mb-1 marathi-font">{scheme.name_mr}</p>}
                                <div className="flex items-center gap-2 text-slate-400 text-sm mt-3 font-body">
                                    <Building2 size={13} />
                                    <span>{scheme.ministry}</span>
                                </div>
                            </div>
                        </motion.div>

                        {/* Benefit */}
                        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
                            className="bg-white rounded-2xl shadow-card p-6">
                            <h2 className="font-display font-semibold text-slate-900 text-base mb-4 flex items-center gap-2">
                                <BadgeIndianRupee size={16} className="text-saffron-500" /> Scheme Benefit
                            </h2>
                            <p className="text-slate-600 font-body text-sm leading-relaxed mb-4">{scheme.benefit_description}</p>
                            {scheme.benefit_amount && (
                                <div className="bg-forest-50 border border-forest-200 rounded-xl p-4 flex items-center gap-3">
                                    <BadgeIndianRupee size={16} className="text-forest-600 shrink-0" />
                                    <div>
                                        <p className="text-forest-600 text-xs font-body font-medium mb-0.5">Benefit Amount</p>
                                        <p className="text-forest-800 font-display font-bold text-sm">{scheme.benefit_amount}</p>
                                    </div>
                                </div>
                            )}
                        </motion.div>

                        {/* Documents */}
                        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }}
                            className="bg-white rounded-2xl shadow-card p-6">
                            <h2 className="font-display font-semibold text-slate-900 text-base mb-4 flex items-center gap-2">
                                <FileText size={16} className="text-saffron-500" /> Documents Required
                            </h2>
                            <ul className="space-y-2.5">
                                {scheme.documents_required.map((doc, i) => (
                                    <motion.li key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + i * 0.04 }}
                                        className="flex items-center gap-3">
                                        <CheckCircle2 size={14} className="text-forest-500 shrink-0" />
                                        <span className="text-slate-700 text-sm font-body">{doc}</span>
                                    </motion.li>
                                ))}
                            </ul>
                        </motion.div>
                    </div>

                    {/* Right */}
                    <div className="space-y-5">

                        {/* Apply CTA */}
                        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}
                            className="bg-gradient-dark rounded-2xl p-6 text-white">
                            <p className="font-display font-semibold text-saffron-400 text-xs uppercase tracking-wide mb-4">Apply for this scheme</p>
                            {scheme.apply_link ? (
                                <a href={scheme.apply_link} target="_blank" rel="noopener noreferrer"
                                    className="flex items-center justify-center gap-2 w-full bg-gradient-saffron text-white font-display font-bold py-3.5 rounded-xl shadow-warm hover:shadow-warm-lg hover:scale-105 transition-all text-sm mb-3">
                                    Apply Online <ExternalLink size={13} />
                                </a>
                            ) : (
                                <p className="text-white/40 text-sm font-body text-center py-2 mb-3">Apply offline only</p>
                            )}
                            {scheme.apply_offline && (
                                <p className="text-white/50 text-xs font-body text-center">{scheme.apply_offline}</p>
                            )}
                        </motion.div>

                        {/* Eligibility */}
                        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}
                            className="bg-white rounded-2xl shadow-card p-6">
                            <h2 className="font-display font-semibold text-slate-900 text-sm mb-2 flex items-center gap-2">
                                <Users size={14} className="text-saffron-500" /> Eligibility Criteria
                            </h2>
                            <InfoRow icon={Users} label="Age Range" value={`${scheme.eligibility.age_min} – ${scheme.eligibility.age_max} years`} />
                            <InfoRow icon={Users} label="Gender" value={scheme.eligibility.gender === 'all' ? 'All Genders' : scheme.eligibility.gender} />
                            <InfoRow icon={MapPin} label="Residence" value={scheme.eligibility.residence === 'maharashtra' ? 'Maharashtra Only' : 'All India'} />
                            <InfoRow icon={BadgeIndianRupee} label="Income Limit"
                                value={scheme.eligibility.income_limit_annual
                                    ? `Up to ₹${scheme.eligibility.income_limit_annual.toLocaleString('en-IN')} / year`
                                    : 'No limit'} />
                            <InfoRow icon={CheckCircle2} label="Caste"
                                value={scheme.eligibility.caste?.includes('all') ? 'All Categories' : scheme.eligibility.caste?.map(c => c.toUpperCase()).join(', ')} />
                            {scheme.eligibility.bpl_required && (
                                <InfoRow icon={FileText} label="BPL Required" value="Must be BPL cardholder" />
                            )}
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    )
}