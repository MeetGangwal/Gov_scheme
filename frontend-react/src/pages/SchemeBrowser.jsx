import { useEffect, useState, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, SlidersHorizontal, Loader2 } from 'lucide-react'
import SchemeResultCard from '@/components/ui/SchemeResultCard.jsx'
import { SCHEME_CATEGORIES, cn } from '@/lib/helpers.js'
import apiClient from '@/lib/apiClient.js'

const LEVELS = [
    { value: '', label: 'All' },
    { value: 'central', label: 'Central' },
    { value: 'state', label: 'Maharashtra' },
]

export default function SchemeBrowser() {
    const [searchParams, setSearchParams] = useSearchParams()
    const initCat = searchParams.get('category') || ''

    const [schemes, setSchemes] = useState([])
    const [loading, setLoading] = useState(true)
    const [category, setCategory] = useState(initCat)
    const [level, setLevel] = useState('')
    const [query, setQuery] = useState('')
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [total, setTotal] = useState(0)

    // Sync category from URL params when navigating from landing page
    useEffect(() => {
        const urlCat = searchParams.get('category') || ''
        if (urlCat !== category) {
            setCategory(urlCat)
        }
    }, [searchParams])

    const fetchSchemes = useCallback(async () => {
        setLoading(true)
        try {
            // If there's a text search query, use the search endpoint
            if (query.trim().length >= 2) {
                const res = await apiClient.get('/api/schemes/search', {
                    params: { q: query.trim() }
                })
                const data = res.data.data
                setSchemes(data.schemes || [])
                setTotalPages(1)
                setTotal(data.count || data.schemes?.length || 0)
            } else {
                // Normal browse with filters
                const params = { page, limit: 12 }
                if (category) params.category = category
                if (level) params.level = level
                const res = await apiClient.get('/api/schemes', { params })
                setSchemes(res.data.data.schemes)
                setTotalPages(res.data.data.pagination.totalPages)
                setTotal(res.data.data.pagination.total)
            }
        } catch { setSchemes([]); setTotal(0) }
        finally { setLoading(false) }
    }, [category, level, page, query])

    useEffect(() => { fetchSchemes() }, [fetchSchemes])
    useEffect(() => { setPage(1) }, [category, level])

    // Debounce search query
    const [debouncedQuery, setDebouncedQuery] = useState('')
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedQuery(query)
            setPage(1)
        }, 400)
        return () => clearTimeout(timer)
    }, [query])

    // Client-side filter for instant feedback while browsing
    const displayed = debouncedQuery.trim() && debouncedQuery.trim().length < 2
        ? schemes.filter(s =>
            s.name_en.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
            (s.name_mr || '').includes(debouncedQuery) ||
            s.benefit_description.toLowerCase().includes(debouncedQuery.toLowerCase())
        )
        : schemes

    return (
        <div className="min-h-screen bg-cream pt-24 pb-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">

                {/* Header */}
                <div className="text-center mb-10">
                    <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="inline-block text-saffron-500 font-display font-semibold text-xs uppercase tracking-widest mb-3"
                    >
                        {total} Schemes Available
                    </motion.span>
                    <motion.h1
                        initial={{ opacity: 0, y: 18 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="font-display font-black text-4xl sm:text-5xl text-slate-900"
                    >
                        All Government <span className="text-saffron-gradient">Schemes</span>
                    </motion.h1>
                    <p className="text-slate-500 font-body mt-3">Maharashtra आणि Central सरकारी योजना</p>
                </div>

                {/* Filters */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="bg-white rounded-2xl shadow-card p-4 mb-6 flex flex-col sm:flex-row gap-4"
                >
                    <div className="relative flex-1">
                        <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                            placeholder="Search schemes... योजना शोधा"
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-slate-200 focus:border-saffron-500 outline-none text-sm font-body text-slate-800 transition-colors"
                        />
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                        <SlidersHorizontal size={14} className="text-slate-400" />
                        {LEVELS.map(l => (
                            <button
                                key={l.value}
                                onClick={() => setLevel(l.value)}
                                className={cn(
                                    'px-3 py-2 rounded-lg text-xs font-display font-semibold transition-all border',
                                    level === l.value
                                        ? 'bg-slate-900 text-white border-slate-900'
                                        : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
                                )}
                            >
                                {l.label}
                            </button>
                        ))}
                    </div>
                </motion.div>

                {/* Category chips */}
                <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
                    <button
                        onClick={() => setCategory('')}
                        className={cn(
                            'shrink-0 px-4 py-1.5 rounded-full text-xs font-display font-semibold border transition-all',
                            category === ''
                                ? 'bg-gradient-saffron text-white border-transparent shadow-warm'
                                : 'bg-white text-slate-600 border-slate-200 hover:border-saffron-300'
                        )}
                    >
                        All
                    </button>
                    {SCHEME_CATEGORIES.map(cat => (
                        <button
                            key={cat.value}
                            onClick={() => setCategory(category === cat.value ? '' : cat.value)}
                            className={cn(
                                'shrink-0 flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-display font-semibold border transition-all',
                                category === cat.value
                                    ? 'bg-gradient-saffron text-white border-transparent shadow-warm'
                                    : 'bg-white text-slate-600 border-slate-200 hover:border-saffron-300'
                            )}
                        >
                            <span>{cat.emoji}</span>
                            <span>{cat.label}</span>
                        </button>
                    ))}
                </div>

                {/* Grid */}
                <AnimatePresence mode="wait">
                    {loading ? (
                        <motion.div key="load" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="flex justify-center py-20">
                            <Loader2 size={30} className="animate-spin text-saffron-500" />
                        </motion.div>
                    ) : displayed.length === 0 ? (
                        <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
                            <div className="text-5xl mb-4">🔍</div>
                            <h3 className="font-display font-bold text-xl text-slate-800 mb-2">No schemes found</h3>
                            <p className="text-slate-500 font-body text-sm">Try a different filter or search term.</p>
                        </motion.div>
                    ) : (
                        <motion.div key="grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
                        >
                            {displayed.map((s, i) => <SchemeResultCard key={s._id} scheme={s} index={i} />)}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Pagination */}
                {!loading && totalPages > 1 && (
                    <div className="flex justify-center items-center gap-2 mt-12">
                        <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                            className="px-5 py-2.5 rounded-xl border-2 border-slate-200 text-slate-600 font-display font-semibold text-sm hover:border-saffron-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
                            Previous
                        </button>
                        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(p => (
                            <button key={p} onClick={() => setPage(p)}
                                className={cn('w-9 h-9 rounded-xl font-display font-semibold text-sm transition-all',
                                    page === p ? 'bg-gradient-saffron text-white shadow-warm' : 'bg-white text-slate-600 border border-slate-200 hover:border-saffron-300'
                                )}>
                                {p}
                            </button>
                        ))}
                        <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                            className="px-5 py-2.5 rounded-xl border-2 border-slate-200 text-slate-600 font-display font-semibold text-sm hover:border-saffron-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
                            Next
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}