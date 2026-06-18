import { useState, useEffect } from 'react'
import { NavLink, Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Globe, ChevronDown, Sparkles } from 'lucide-react'
import { cn } from '@/lib/helpers.js'

const NAV_LINKS = [
    { to: '/', label: 'Home', label_mr: 'मुखपृष्ठ' },
    { to: '/check', label: 'Check Eligibility', label_mr: 'पात्रता तपासा' },
    { to: '/schemes', label: 'All Schemes', label_mr: 'सर्व योजना' },
    { to: '/search', label: 'AI Search', label_mr: 'AI शोध' },
]

const LANGS = [
    { code: 'en', label: 'English' },
    { code: 'mr', label: 'मराठी' },
    { code: 'hi', label: 'हिंदी' },
]

export default function TopNavbar() {
    const [scrolled, setScrolled] = useState(false)
    const [menuOpen, setMenuOpen] = useState(false)
    const [langOpen, setLangOpen] = useState(false)
    const [activeLang, setActiveLang] = useState('en')
    const { pathname } = useLocation()

    // Pages with dark hero backgrounds where transparent navbar looks good
    const isDarkHeroPage = pathname === '/'

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 24)
        window.addEventListener('scroll', onScroll, { passive: true })
        return () => window.removeEventListener('scroll', onScroll)
    }, [])

    useEffect(() => { setMenuOpen(false) }, [pathname])

    const getLabel = (link) => activeLang === 'mr' ? link.label_mr : link.label

    // Always show solid bg on non-hero pages, or when scrolled on hero page
    const showSolidBg = !isDarkHeroPage || scrolled

    return (
        <motion.header
            initial={{ y: -70, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.55, ease: 'easeOut' }}
            className={cn(
                'fixed top-0 left-0 right-0 z-50 transition-all duration-500',
                showSolidBg
                    ? 'nav-blur shadow-lg py-3'
                    : 'bg-transparent py-5'
            )}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">

                {/* Logo */}
                <Link to="/" className="flex items-center gap-3 group">
                    <div className="relative w-10 h-10 rounded-xl bg-gradient-saffron flex items-center justify-center shadow-warm group-hover:scale-110 transition-transform duration-300">
                        <span className="text-white font-display font-bold text-lg leading-none marathi-font">य</span>
                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-forest-600 rounded-full border-2 border-white animate-pulse" />
                    </div>
                    <div className="hidden sm:block">
                        <p className="font-display font-bold text-white text-sm leading-tight">Yojana Setu</p>
                        <p className="text-white/45 text-xs font-body">योजना सेतू</p>
                    </div>
                </Link>

                {/* Desktop nav */}
                <nav className="hidden md:flex items-center gap-1">
                    {NAV_LINKS.map((link) => (
                        <NavLink
                            key={link.to}
                            to={link.to}
                            end={link.to === '/'}
                            className={({ isActive }) => cn(
                                'px-4 py-2 rounded-xl text-sm font-body font-medium transition-all duration-200',
                                isActive
                                    ? 'bg-saffron-500 text-white shadow-warm'
                                    : 'text-white/65 hover:text-white hover:bg-white/10'
                            )}
                        >
                            {getLabel(link)}
                        </NavLink>
                    ))}
                </nav>

                {/* Right side */}
                <div className="hidden md:flex items-center gap-3">
                    {/* Language dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => setLangOpen(!langOpen)}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl glass-dark text-white/70 hover:text-white text-xs font-body transition-all border border-white/10"
                        >
                            <Globe size={13} />
                            {LANGS.find(l => l.code === activeLang)?.label}
                            <ChevronDown size={11} className={cn('transition-transform', langOpen && 'rotate-180')} />
                        </button>
                        <AnimatePresence>
                            {langOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: 6, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 6, scale: 0.95 }}
                                    transition={{ duration: 0.15 }}
                                    className="absolute right-0 top-full mt-2 w-32 bg-white rounded-2xl shadow-card-hover overflow-hidden border border-slate-100"
                                >
                                    {LANGS.map((l) => (
                                        <button
                                            key={l.code}
                                            onClick={() => { setActiveLang(l.code); setLangOpen(false) }}
                                            className={cn(
                                                'w-full px-4 py-2.5 text-left text-sm font-body transition-colors',
                                                activeLang === l.code
                                                    ? 'bg-saffron-500 text-white font-semibold'
                                                    : 'text-slate-700 hover:bg-saffron-50'
                                            )}
                                        >
                                            {l.label}
                                        </button>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <Link
                        to="/check"
                        className="flex items-center gap-2 px-5 py-2.5 bg-gradient-saffron text-white rounded-xl font-display font-semibold text-sm shadow-warm hover:shadow-warm-lg hover:scale-105 transition-all duration-300"
                    >
                        <Sparkles size={14} />
                        Check Now
                    </Link>
                </div>

                {/* Mobile toggle */}
                <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="md:hidden text-white p-2 rounded-xl glass-dark"
                    aria-label="Toggle menu"
                >
                    {menuOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
            </div>

            {/* Mobile menu */}
            <AnimatePresence>
                {menuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.28, ease: 'easeInOut' }}
                        className="md:hidden overflow-hidden nav-blur border-t border-white/10"
                    >
                        <div className="px-4 py-4 space-y-1.5">
                            {NAV_LINKS.map((link, i) => (
                                <motion.div
                                    key={link.to}
                                    initial={{ opacity: 0, x: -16 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.06 }}
                                >
                                    <NavLink
                                        to={link.to}
                                        end={link.to === '/'}
                                        className={({ isActive }) => cn(
                                            'block px-4 py-3 rounded-xl text-sm font-body font-medium transition-all',
                                            isActive ? 'bg-saffron-500 text-white' : 'text-white/65 hover:text-white hover:bg-white/10'
                                        )}
                                    >
                                        {getLabel(link)}
                                    </NavLink>
                                </motion.div>
                            ))}
                            {/* Mobile language switch */}
                            <div className="flex gap-2 pt-2">
                                {LANGS.map(l => (
                                    <button
                                        key={l.code}
                                        onClick={() => setActiveLang(l.code)}
                                        className={cn(
                                            'flex-1 py-2 rounded-xl text-xs font-body font-semibold transition-all',
                                            activeLang === l.code ? 'bg-saffron-500 text-white' : 'glass-dark text-white/55 hover:text-white'
                                        )}
                                    >
                                        {l.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.header>
    )
}