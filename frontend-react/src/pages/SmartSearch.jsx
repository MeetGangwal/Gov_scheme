import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Sparkles, ArrowRight, Globe2, Loader2 } from 'lucide-react'
import SchemeResultCard from '@/components/ui/SchemeResultCard.jsx'
import apiClient from '@/lib/apiClient.js'
import { cn } from '@/lib/helpers.js'
import toast from 'react-hot-toast'

const EXAMPLE_QUERIES = [
    { text: 'I am a 45-year-old widow farmer in Maharashtra', lang: 'en' },
    { text: 'माझे वय ६५ आहे, BPL कार्डधारक आहे', lang: 'mr' },
    { text: 'मुझे घर बनाने के लिए सरकारी सहायता चाहिए', lang: 'hi' },
    { text: 'SC student needs education scholarship', lang: 'en' },
    { text: 'शेतकरी पीक विमा माहिती हवी आहे', lang: 'mr' },
    { text: 'Small business loan for OBC women entrepreneur', lang: 'en' },
]

const LANGS = [
    { code: 'en', label: 'English' },
    { code: 'mr', label: 'मराठी' },
    { code: 'hi', label: 'हिंदी' },
]

export default function SmartSearch() {
    const [query, setQuery] = useState('')
    const [lang, setLang] = useState('en')
    const [mode, setMode] = useState('ai')
    const [loading, setLoading] = useState(false)
    const [results, setResults] = useState([])
    const [aiProfile, setAiProfile] = useState(null)
    const [searched, setSearched] = useState(false)
    const inputRef = useRef(null)

    const runSearch = async (q) => {
        const finalQ = q ?? query
        if (!finalQ.trim() || finalQ.trim().length < 2) { toast.error('Please enter at least 2 characters'); return }
        setLoading(true)
        setSearched(true)
        setAiProfile(null)
        try {
            if (mode === 'ai') {
                const res = await apiClient.post('/api/schemes/ai-assist', { query: finalQ, lang })
                setResults(res.data.data.schemes || [])
                setAiProfile(res.data.data.extracted_profile || null)
                toast.success(`AI found ${res.data.data.matched_count} schemes`)
            } else {
                const res = await apiClient.get('/api/schemes/search', { params: { q: finalQ, lang } })
                setResults(res.data.data.schemes || [])
            }
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Search failed. Try again.')
            setResults([])
        } finally { setLoading(false) }
    }

    const useExample = (text, qlang) => {
        setQuery(text)
        setLang(qlang)
        setMode('ai')
        setTimeout(() => runSearch(text), 50)
        inputRef.current?.focus()
    }

    return (
        <div className="min-h-screen bg-cream pt-24 pb-16">
            <div className="max-w-4xl mx-auto px-4 sm:px-6">

                {/* Header */}
                <div className="text-center mb-10">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.85 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center gap-2 bg-gradient-dark rounded-full px-4 py-2 mb-5"
                    >
                        <Sparkles size={13} className="text-saffron-400" />
                        <span className="text-white/75 text-xs font-body font-medium">Powered by Google Gemini AI</span>
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 18 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="font-display font-black text-4xl sm:text-5xl text-slate-900 mb-3"
                    >
                        Search in <span className="text-saffron-gradient">Your Language</span>
                    </motion.h1>
                    <p className="text-slate-500 font-body">Type in Marathi, Hindi, or English — AI understands all three</p>
                </div>

                {/* Search card */}
                <motion.div
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.18 }}
                    className="bg-white rounded-3xl shadow-card-hover p-5 sm:p-6 mb-8 border border-slate-100"
                >
                    {/* Mode toggle */}
                    <div className="flex gap-2 mb-5 bg-slate-100 rounded-2xl p-1">
                        {[['text', 'Keyword Search', Search], ['ai', 'AI Smart Search', Sparkles]].map(([m, label, Icon]) => (
                            <button
                                key={m}
                                onClick={() => setMode(m)}
                                className={cn(
                                    'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-display font-semibold transition-all',
                                    mode === m ? 'bg-gradient-dark text-white shadow-lg' : 'text-slate-500 hover:text-slate-800'
                                )}
                            >
                                <Icon size={13} /> {label}
                            </button>
                        ))}
                    </div>

                    {/* Language selector */}
                    <div className="flex items-center gap-2 mb-4">
                        <Globe2 size={14} className="text-slate-400 shrink-0" />
                        {LANGS.map(l => (
                            <button
                                key={l.code}
                                onClick={() => setLang(l.code)}
                                className={cn(
                                    'px-3.5 py-1.5 rounded-full text-xs font-display font-semibold border transition-all',
                                    lang === l.code
                                        ? 'bg-saffron-500 text-white border-saffron-500'
                                        : 'bg-white text-slate-600 border-slate-200 hover:border-saffron-300'
                                )}
                            >
                                {l.label}
                            </button>
                        ))}
                    </div>

                    {/* Input */}
                    <div className="relative">
                        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        <input
                            ref={inputRef}
                            type="text"
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && runSearch()}
                            placeholder={
                                lang === 'mr' ? 'येथे मराठीत टाइप करा...'
                                    : lang === 'hi' ? 'यहाँ हिंदी में लिखें...'
                                        : mode === 'ai'
                                            ? 'e.g. I am a 30-year-old SC farmer needing health help...'
                                            : 'e.g. widow pension health scheme...'
                            }
                            className="w-full pl-11 pr-14 py-4 rounded-2xl border-2 border-slate-200 focus:border-saffron-500 outline-none text-slate-900 font-body text-sm transition-colors bg-slate-50/50"
                        />
                        <button
                            onClick={() => runSearch()}
                            disabled={loading}
                            className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-gradient-saffron text-white rounded-xl flex items-center justify-center hover:shadow-warm hover:scale-110 transition-all disabled:opacity-50"
                        >
                            {loading ? <Loader2 size={15} className="animate-spin" /> : <ArrowRight size={15} />}
                        </button>
                    </div>

                    {mode === 'ai' && (
                        <p className="text-slate-400 text-xs font-body mt-3 text-center">
                            ✨ AI will extract your profile and find matching schemes automatically
                        </p>
                    )}
                </motion.div>

                {/* Example queries */}
                {!searched && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="mb-10">
                        <p className="text-slate-500 text-xs font-body text-center mb-4">Try these example queries:</p>
                        <div className="flex flex-wrap gap-2 justify-center">
                            {EXAMPLE_QUERIES.map((ex, i) => (
                                <motion.button
                                    key={i}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.35 + i * 0.05 }}
                                    onClick={() => useExample(ex.text, ex.lang)}
                                    className="flex items-center gap-1.5 bg-white border border-slate-200 hover:border-saffron-400 text-slate-700 hover:text-saffron-700 text-xs font-body px-3 py-2 rounded-xl transition-all hover:shadow-sm"
                                >
                                    <Sparkles size={10} className="text-saffron-400 shrink-0" />
                                    {ex.text}
                                </motion.button>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* AI Profile */}
                <AnimatePresence>
                    {aiProfile && (
                        <motion.div
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="bg-slate-900 rounded-2xl p-5 mb-6 border border-saffron-500/20"
                        >
                            <div className="flex items-center gap-2 mb-3">
                                <Sparkles size={13} className="text-saffron-400" />
                                <p className="text-saffron-400 font-display font-semibold text-xs">AI extracted your profile</p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {Object.entries(aiProfile)
                                    .filter(([k]) => k !== 'summary')
                                    .map(([key, val]) =>
                                        val !== null && val !== undefined && String(val) !== '' && (
                                            <span key={key} className="bg-white/10 text-white/75 text-xs font-body px-3 py-1 rounded-full capitalize">
                                                {key.replace(/_/g, ' ')}: <strong className="text-saffron-300">{Array.isArray(val) ? val.join(', ') : String(val)}</strong>
                                            </span>
                                        )
                                    )}
                            </div>
                            {aiProfile.summary && (
                                <p className="text-white/40 text-xs font-body mt-3 italic">"{aiProfile.summary}"</p>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Results */}
                <AnimatePresence mode="wait">
                    {loading && (
                        <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="flex flex-col items-center py-16 gap-4">
                            <div className="relative w-12 h-12">
                                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.1, repeat: Infinity, ease: 'linear' }}
                                    className="w-12 h-12 rounded-full border-4 border-slate-100 border-t-saffron-500" />
                                <Sparkles size={13} className="absolute inset-0 m-auto text-saffron-400" />
                            </div>
                            <p className="font-display font-semibold text-slate-700 text-sm">
                                {mode === 'ai' ? 'AI is analysing your query…' : 'Searching schemes…'}
                            </p>
                        </motion.div>
                    )}

                    {!loading && searched && (
                        <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            {results.length === 0 ? (
                                <div className="text-center py-14">
                                    <div className="text-5xl mb-4">🔍</div>
                                    <h3 className="font-display font-bold text-xl text-slate-800 mb-2">No schemes found</h3>
                                    <p className="text-slate-500 font-body text-sm">Try rephrasing your query or use different keywords.</p>
                                </div>
                            ) : (
                                <>
                                    <div className="mb-5">
                                        <span className="font-display font-bold text-slate-900 text-xl">{results.length}</span>
                                        <span className="text-slate-500 font-body text-sm ml-2">schemes found</span>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        {results.map((s, i) => <SchemeResultCard key={s._id} scheme={s} index={i} />)}
                                    </div>
                                </>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}