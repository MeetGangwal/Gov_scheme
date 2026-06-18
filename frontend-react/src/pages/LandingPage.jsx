import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import CountUp from 'react-countup'
import {
    ArrowRight, CheckCircle2, Sparkles, Shield,
    FileCheck, Zap, Globe2, ChevronRight, Users, Star,
} from 'lucide-react'
import { SCHEME_CATEGORIES } from '@/lib/helpers.js'

/* ── Floating particle ───────────────────────────────────── */
function Particle({ x, y, size, delay }) {
    return (
        <motion.div
            className="absolute rounded-full bg-saffron-400/20 pointer-events-none"
            style={{ left: `${x}%`, top: `${y}%`, width: size, height: size }}
            animate={{ y: [0, -28, 0], opacity: [0.15, 0.55, 0.15] }}
            transition={{ duration: 4 + delay, repeat: Infinity, delay, ease: 'easeInOut' }}
        />
    )
}

/* ── Stat card ───────────────────────────────────────────── */
function StatCard({ value, suffix, label, icon: Icon, delay }) {
    const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.3 })
    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.55, delay, ease: 'easeOut' }}
            className="glass-dark rounded-2xl p-5 text-center border border-white/8"
        >
            <div className="w-11 h-11 bg-gradient-saffron rounded-xl flex items-center justify-center mx-auto mb-3 shadow-warm">
                <Icon size={20} className="text-white" />
            </div>
            <div className="font-display font-black text-3xl text-white">
                {inView ? <CountUp end={value} duration={2} suffix={suffix || ''} /> : '0'}
            </div>
            <p className="text-white/50 text-xs font-body mt-1">{label}</p>
        </motion.div>
    )
}

/* ── Step card ───────────────────────────────────────────── */
function HowItWorksCard({ step, title, desc, delay }) {
    const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.2 })
    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 36 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.55, delay, ease: 'easeOut' }}
            className="relative bg-white rounded-2xl p-6 shadow-card hover:shadow-card-hover border border-slate-100 transition-all duration-300 group"
        >
            <div className="absolute -top-4 left-6 w-9 h-9 bg-gradient-dark rounded-xl flex items-center justify-center shadow-lg">
                <span className="font-display font-bold text-saffron-400 text-sm">{step}</span>
            </div>
            <h3 className="font-display font-semibold text-slate-800 text-base mt-3 mb-2 group-hover:text-saffron-600 transition-colors">
                {title}
            </h3>
            <p className="text-slate-500 text-sm font-body leading-relaxed">{desc}</p>
        </motion.div>
    )
}

/* ── Scheme name marquee ─────────────────────────────────── */
const MARQUEE_NAMES = [
    'PM Kisan Samman Nidhi', 'Ladki Bahin Yojana', 'MJPJAY Health Scheme',
    'PM Awas Yojana', 'Atal Pension Yojana', 'PM Mudra Yojana',
    'Savitribai Phule Scholarship', 'Ayushman Bharat PM-JAY', 'NREGA Employment',
    'Sukanya Samriddhi', 'Stand Up India', 'Swadhar Greh Scheme',
]

function SchemeMarquee() {
    const doubled = [...MARQUEE_NAMES, ...MARQUEE_NAMES]
    return (
        <div className="overflow-hidden py-3 w-full">
            <motion.div
                animate={{ x: ['0%', '-50%'] }}
                transition={{ duration: 28, repeat: Infinity, ease: 'linear' }}
                className="flex gap-3 w-max"
            >
                {doubled.map((name, i) => (
                    <span
                        key={i}
                        className="shrink-0 flex items-center gap-2 bg-white/8 border border-white/15 rounded-full px-4 py-1.5 text-white/70 text-xs font-body"
                    >
                        <CheckCircle2 size={11} className="text-saffron-400" />
                        {name}
                    </span>
                ))}
            </motion.div>
        </div>
    )
}

/* ── Main page ───────────────────────────────────────────── */
export default function LandingPage() {
    const heroRef = useRef(null)
    const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
    const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '22%'])
    const heroOpacity = useTransform(scrollYProgress, [0, 0.75], [1, 0])

    const [hoveredCat, setHoveredCat] = useState(null)

    const particles = [
        { x: 8, y: 18, size: 8, delay: 0 },
        { x: 88, y: 12, size: 12, delay: 1 },
        { x: 22, y: 72, size: 6, delay: 2 },
        { x: 72, y: 58, size: 10, delay: 0.5 },
        { x: 48, y: 28, size: 7, delay: 1.5 },
        { x: 92, y: 78, size: 9, delay: 3 },
        { x: 4, y: 88, size: 5, delay: 2.5 },
        { x: 62, y: 88, size: 8, delay: 1.2 },
    ]

    return (
        <>
            {/* ── HERO ──────────────────────────────────────────── */}
            <section
                ref={heroRef}
                className="relative min-h-screen bg-gradient-dark overflow-hidden flex items-center"
            >
                {/* Grid overlay */}
                <div
                    className="absolute inset-0 opacity-[0.07] pointer-events-none"
                    style={{
                        backgroundImage:
                            'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg,rgba(255,255,255,0.1) 1px, transparent 1px)',
                        backgroundSize: '55px 55px',
                    }}
                />

                {/* Glow orbs */}
                <div className="absolute top-1/4 -left-40 w-96 h-96 bg-saffron-500/15 rounded-full blur-3xl animate-float pointer-events-none" />
                <div className="absolute bottom-1/4 -right-40 w-80 h-80 bg-forest-600/15 rounded-full blur-3xl animate-float-slow pointer-events-none" />

                {/* Particles */}
                {particles.map((p, i) => <Particle key={i} {...p} />)}

                <motion.div
                    style={{ y: heroY, opacity: heroOpacity }}
                    className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-28 pb-16 w-full"
                >
                    <div className="max-w-4xl mx-auto text-center">

                        {/* Badge */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.85 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5 }}
                            className="inline-flex items-center gap-2 glass-dark border border-saffron-500/25 rounded-full px-4 py-2 mb-8"
                        >
                            <Sparkles size={13} className="text-saffron-400" />
                            <span className="text-white/75 text-xs font-body font-medium">
                                AI-Powered · Marathi Support · 50+ Schemes · Free Forever
                            </span>
                            <Sparkles size={13} className="text-saffron-400" />
                        </motion.div>

                        {/* Headline */}
                        <motion.h1
                            initial={{ opacity: 0, y: 36 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.65, delay: 0.15 }}
                            className="font-display font-black text-5xl sm:text-6xl md:text-7xl text-white leading-[1.08] tracking-tight mb-5"
                        >
                            सरकारी योजना
                            <br />
                            <span className="text-saffron-gradient">शोधा सेकंदात</span>
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 24 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.3 }}
                            className="text-white/65 text-lg sm:text-xl font-body leading-relaxed mb-3 max-w-2xl mx-auto"
                        >
                            Answer 5 simple questions. Instantly discover every Maharashtra and central government scheme your family qualifies for.
                        </motion.p>

                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.45 }}
                            className="text-white/30 text-sm font-body mb-10 marathi-font"
                        >
                            ५ प्रश्न · ३० सेकंद · तुमच्या भाषेत — विनामूल्य
                        </motion.p>

                        {/* CTA buttons */}
                        <motion.div
                            initial={{ opacity: 0, y: 18 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.55, delay: 0.5 }}
                            className="flex flex-col sm:flex-row gap-4 justify-center"
                        >
                            <Link
                                to="/check"
                                className="group relative inline-flex items-center gap-3 bg-gradient-saffron text-white font-display font-bold text-base px-8 py-4 rounded-2xl shadow-warm hover:shadow-warm-lg hover:scale-105 transition-all duration-300 overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-shimmer-line bg-[length:400px_100%] animate-shimmer opacity-0 group-hover:opacity-100 transition-opacity" />
                                <Zap size={18} className="relative z-10" />
                                <span className="relative z-10">Check My Eligibility</span>
                                <ArrowRight size={18} className="relative z-10 group-hover:translate-x-1 transition-transform" />
                            </Link>

                            <Link
                                to="/schemes"
                                className="inline-flex items-center gap-3 glass-dark text-white font-display font-semibold text-base px-8 py-4 rounded-2xl hover:bg-white/12 transition-all duration-300 border border-white/15"
                            >
                                <Globe2 size={18} />
                                Browse All Schemes
                            </Link>
                        </motion.div>

                        {/* Trust row */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.8 }}
                            className="flex flex-wrap justify-center gap-6 mt-12 text-white/40 text-xs font-body"
                        >
                            {[
                                { icon: Shield, label: 'Govt. Verified Data' },
                                { icon: Users, label: '50+ Schemes Listed' },
                                { icon: FileCheck, label: 'Marathi / Hindi / English' },
                                { icon: Star, label: 'Free to Use Always' },
                            ].map(({ icon: Icon, label }) => (
                                <div key={label} className="flex items-center gap-1.5">
                                    <Icon size={12} className="text-saffron-500" />
                                    <span>{label}</span>
                                </div>
                            ))}
                        </motion.div>
                    </div>

                    {/* Marquee */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1 }}
                        className="mt-14 hidden lg:block"
                    >
                        <SchemeMarquee />
                    </motion.div>
                </motion.div>

                {/* Bottom wave */}
                <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
                    <svg viewBox="0 0 1440 72" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
                        <path d="M0 72L1440 72L1440 36C1200 72 960 0 720 18C480 36 240 72 0 36L0 72Z" fill="#FAFAF7" />
                    </svg>
                </div>
            </section>

            {/* ── STATS ─────────────────────────────────────────── */}
            <section className="bg-gradient-dark py-14 -mt-1">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <StatCard value={50} suffix="+" label="Government Schemes" icon={FileCheck} delay={0} />
                        <StatCard value={25} suffix="+" label="Maharashtra State Schemes" icon={Globe2} delay={0.1} />
                        <StatCard value={3} suffix=" langs" label="Marathi Hindi English" icon={Globe2} delay={0.2} />
                        <StatCard value={100} suffix="%" label="Free to Use" icon={Shield} delay={0.3} />
                    </div>
                </div>
            </section>

            {/* ── HOW IT WORKS ──────────────────────────────────── */}
            <section className="py-24 bg-cream">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="text-center mb-16">
                        <motion.span
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            className="inline-block text-saffron-500 font-display font-semibold text-xs uppercase tracking-widest mb-3"
                        >
                            Simple 3-Step Process
                        </motion.span>
                        <motion.h2
                            initial={{ opacity: 0, y: 18 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.55 }}
                            className="font-display font-black text-4xl sm:text-5xl text-slate-900"
                        >
                            Find schemes in{' '}
                            <span className="text-saffron-gradient">under a minute</span>
                        </motion.h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-6">
                        <HowItWorksCard
                            step="01" delay={0}
                            title="Fill Your Profile"
                            desc="Answer 5 simple questions — age, income, caste, location, and what kind of help you need. Takes 60 seconds."
                        />
                        <HowItWorksCard
                            step="02" delay={0.12}
                            title="AI Matches Schemes"
                            desc="Our eligibility engine checks your profile against 50+ schemes instantly. Gemini AI understands natural language queries in Marathi."
                        />
                        <HowItWorksCard
                            step="03" delay={0.24}
                            title="Apply Directly"
                            desc="See every scheme you qualify for with benefit amounts, required documents, and direct official apply links."
                        />
                    </div>
                </div>
            </section>

            {/* ── CATEGORIES ────────────────────────────────────── */}
            <section className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="text-center mb-14">
                        <motion.h2
                            initial={{ opacity: 0, y: 18 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="font-display font-black text-4xl sm:text-5xl text-slate-900"
                        >
                            Schemes for{' '}
                            <span className="text-saffron-gradient">every need</span>
                        </motion.h2>
                        <p className="text-slate-500 font-body mt-3 text-base">प्रत्येक गरजेसाठी योजना</p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                        {SCHEME_CATEGORIES.map((cat, i) => (
                            <motion.div
                                key={cat.value}
                                initial={{ opacity: 0, scale: 0.85 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.35, delay: i * 0.045 }}
                            >
                                <Link
                                    to={`/schemes?category=${cat.value}`}
                                    onMouseEnter={() => setHoveredCat(cat.value)}
                                    onMouseLeave={() => setHoveredCat(null)}
                                    className="flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all duration-250 cursor-pointer"
                                    style={{
                                        borderColor: hoveredCat === cat.value ? '#F97316' : '#E2E8F0',
                                        background: hoveredCat === cat.value ? 'linear-gradient(135deg,#FFF7ED,#FFEDD5)' : '#fff',
                                        transform: hoveredCat === cat.value ? 'translateY(-4px)' : 'none',
                                        boxShadow: hoveredCat === cat.value ? '0 12px 28px rgba(249,115,22,0.18)' : '0 2px 8px rgba(30,41,59,0.05)',
                                    }}
                                >
                                    <span className="text-3xl">{cat.emoji}</span>
                                    <span className="font-display font-semibold text-slate-800 text-xs text-center leading-tight">{cat.label}</span>
                                    <span className="text-slate-400 text-xs font-body text-center marathi-font">{cat.label_mr}</span>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── FINAL CTA ─────────────────────────────────────── */}
            <section className="py-24 bg-cream">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 36 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.65 }}
                        className="bg-gradient-dark rounded-3xl p-12 relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-72 h-72 bg-saffron-500/10 rounded-full blur-3xl pointer-events-none" />
                        <div className="absolute bottom-0 left-0 w-56 h-56 bg-forest-600/10 rounded-full blur-3xl pointer-events-none" />
                        <div className="relative z-10">
                            <p className="text-saffron-400 font-display font-semibold text-xs uppercase tracking-widest mb-4">
                                Start Now — विनामूल्य
                            </p>
                            <h2 className="font-display font-black text-4xl sm:text-5xl text-white mb-4 leading-tight">
                                Don't miss the benefits
                                <br />
                                <span className="text-saffron-gradient">you deserve</span>
                            </h2>
                            <p className="text-white/50 font-body text-base mb-10 max-w-xl mx-auto leading-relaxed">
                                Thousands of Maharashtra families miss out on schemes they're entitled to. Check yours right now — it takes 60 seconds and is completely free.
                            </p>
                            <Link
                                to="/check"
                                className="group inline-flex items-center gap-3 bg-gradient-saffron text-white font-display font-bold text-base px-10 py-4 rounded-2xl shadow-warm hover:shadow-warm-lg hover:scale-105 transition-all duration-300"
                            >
                                <Zap size={18} />
                                Check My Eligibility Free
                                <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>
        </>
    )
}