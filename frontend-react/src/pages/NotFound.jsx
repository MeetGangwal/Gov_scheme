import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Home, Search, ArrowLeft } from 'lucide-react'

export default function NotFound() {
    return (
        <div className="min-h-screen bg-cream flex items-center justify-center px-4">
            <div className="text-center max-w-md">

                {/* Animated 404 */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.7 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                    className="mb-8"
                >
                    <div className="relative inline-block">
                        <span className="font-display font-black text-[9rem] leading-none text-slate-100 select-none">
                            404
                        </span>
                        <motion.div
                            animate={{ y: [0, -12, 0] }}
                            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                            className="absolute inset-0 flex items-center justify-center"
                        >
                            <span className="text-7xl">🔍</span>
                        </motion.div>
                    </div>
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="font-display font-black text-3xl text-slate-900 mb-3"
                >
                    Page Not Found
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-slate-500 font-body text-base mb-2 leading-relaxed"
                >
                    The page you're looking for doesn't exist or has been moved.
                </motion.p>

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="text-slate-400 text-sm font-body marathi-font mb-10"
                >
                    हे पान सापडले नाही
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.45 }}
                    className="flex flex-col sm:flex-row gap-3 justify-center"
                >
                    <Link
                        to="/"
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-saffron text-white font-display font-bold text-sm rounded-xl shadow-warm hover:shadow-warm-lg hover:scale-105 transition-all"
                    >
                        <Home size={15} /> Go Home
                    </Link>
                    <Link
                        to="/schemes"
                        className="flex items-center justify-center gap-2 px-6 py-3 border-2 border-slate-200 text-slate-700 font-display font-semibold text-sm rounded-xl hover:border-saffron-400 hover:text-saffron-600 transition-all"
                    >
                        <Search size={15} /> Browse Schemes
                    </Link>
                    <button
                        onClick={() => window.history.back()}
                        className="flex items-center justify-center gap-2 px-6 py-3 border-2 border-slate-200 text-slate-600 font-display font-semibold text-sm rounded-xl hover:border-slate-400 transition-all"
                    >
                        <ArrowLeft size={15} /> Go Back
                    </button>
                </motion.div>
            </div>
        </div>
    )
}