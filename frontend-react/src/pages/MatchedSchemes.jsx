import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Trophy, Filter, RefreshCcw, Sparkles } from 'lucide-react'
import SchemeResultCard from '@/components/ui/SchemeResultCard.jsx'
import PageSpinner from '@/components/ui/PageSpinner.jsx'
import { SCHEME_CATEGORIES, cn } from '@/lib/helpers.js'

export default function MatchedSchemes() {
    const [result, setResult] = useState(null)
    const [filtered, setFiltered] = useState([])
    const [activeF, setActiveF] = useState('all')
    const [ready, setReady] = useState(false)

    useEffect(() => {
        const raw = sessionStorage.getItem('eligibilityResult')
        if (raw) {
            const data = JSON.parse(raw)
            setResult(data)
            setFiltered(data.schemes)
        }
        setReady(true)
    }, [])

    const applyFilter = (cat) => {
        setActiveF(cat)
        if (!result) return
        setFiltered(cat === 'all' ? result.schemes : result.schemes.filter(s => s.category.includes(cat)))
    }

    if (!ready) return <PageSpinner text="Loading your results..." />

    if (!result) {
        return (
            <div className="min-h-screen bg-cream flex items-center justify-center px-4">
                <div className="text-center">
                    <div className="text-6xl mb-4">🔍</div>
                    <h2 className="font-display font-bold text-2xl text-slate-900 mb-2">No results yet</h2>
                    <p className="text-slate-500 font-body mb-6">Please complete the eligibility check first.</p>
                    <Link to="/check" className="inline-flex items-center gap-2 bg-gradient-saffron text-white font-display font-semibold px-6 py-3 rounded-xl shadow-warm hover:scale-105 transition-all">
                        <Sparkles size={15} /> Check Eligibility
                    </Link>
                </div>
            </div>
        )
    }

    const { matched_count, schemes, profile_used } = result
    const presentCats = ['all', ...Array.from(new Set(schemes.flatMap(s => s.category)))]

    return (
        <div className="min-h-screen bg-cream pt-24 pb-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">

                {/* Back */}
                <Link to="/check" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-800 text-sm font-body mb-6 transition-colors">
                    <ArrowLeft size={14} /> Back to check
                </Link>

                {/* Page header */}
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
                    <div>
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center gap-2 mb-3"
                        >
                            <Trophy size={18} className="text-saffron-500" />
                            <span className="text-saffron-600 font-display font-semibold text-xs uppercase tracking-widest">
                                Your Eligible Schemes
                            </span>
                        </motion.div>
                        <motion.h1
                            initial={{ opacity: 0, y: 18 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.08 }}
                            className="font-display font-black text-4xl sm:text-5xl text-slate-900"
                        >
                            {matched_count === 0 ? 'No matches found' : (
                                <><span className="text-saffron-gradient">{matched_count} schemes</span> found for you</>
                            )}
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.18 }}
                            className="text-slate-500 font-body text-sm mt-2"
                        >
                            Age {profile_used?.age} · {profile_used?.gender} · {profile_used?.caste?.toUpperCase()} · ₹{profile_used?.annual_income?.toLocaleString('en-IN')} income
                        </motion.p>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link to="/check" className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-slate-200 text-slate-600 font-display font-semibold text-sm hover:border-saffron-400 hover:text-saffron-600 transition-all">
                            <RefreshCcw size={13} /> Check Again
                        </Link>
                        <Link to="/search" className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-saffron text-white font-display font-semibold text-sm shadow-warm hover:shadow-warm-lg hover:scale-105 transition-all">
                            <Sparkles size={13} /> AI Search
                        </Link>
                    </div>
                </div>

                {matched_count === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-3xl shadow-card p-12 text-center max-w-md mx-auto"
                    >
                        <div className="text-6xl mb-4">😔</div>
                        <h2 className="font-display font-bold text-xl text-slate-900 mb-2">No schemes matched your profile</h2>
                        <p className="text-slate-500 font-body text-sm mb-6 leading-relaxed">
                            Try browsing all schemes or use AI search with natural language in Marathi or Hindi.
                        </p>
                        <div className="flex gap-3 justify-center">
                            <Link to="/schemes" className="px-5 py-2.5 rounded-xl border-2 border-slate-200 text-slate-600 font-display font-semibold text-sm hover:border-slate-400 transition-all">Browse All</Link>
                            <Link to="/search" className="px-5 py-2.5 rounded-xl bg-gradient-saffron text-white font-display font-semibold text-sm shadow-warm hover:scale-105 transition-all">AI Search</Link>
                        </div>
                    </motion.div>
                ) : (
                    <>
                        {/* Filters */}
                        <motion.div
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.22 }}
                            className="flex items-center gap-2 mb-6 overflow-x-auto pb-2"
                        >
                            <Filter size={14} className="text-slate-400 shrink-0" />
                            {presentCats.map(cat => {
                                const info = SCHEME_CATEGORIES.find(c => c.value === cat)
                                return (
                                    <button
                                        key={cat}
                                        onClick={() => applyFilter(cat)}
                                        className={cn(
                                            'shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-display font-semibold transition-all border',
                                            activeF === cat
                                                ? 'bg-gradient-saffron text-white border-transparent shadow-warm'
                                                : 'bg-white text-slate-600 border-slate-200 hover:border-saffron-300'
                                        )}
                                    >
                                        {info && <span>{info.emoji}</span>}
                                        <span className="capitalize">{cat === 'all' ? 'All' : cat}</span>
                                    </button>
                                )
                            })}
                        </motion.div>

                        <p className="text-slate-400 text-xs font-body mb-5">Showing {filtered.length} of {matched_count} schemes</p>

                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeF}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
                            >
                                {filtered.map((scheme, i) => (
                                    <SchemeResultCard key={scheme._id} scheme={scheme} index={i} />
                                ))}
                            </motion.div>
                        </AnimatePresence>
                    </>
                )}
            </div>
        </div>
    )
}