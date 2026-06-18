import { motion } from 'framer-motion'

export default function PageSpinner({ text = 'Loading...' }) {
    return (
        <div className="flex flex-col items-center justify-center py-24 gap-5">
            <div className="relative w-14 h-14">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1.1, repeat: Infinity, ease: 'linear' }}
                    className="w-14 h-14 rounded-full border-4 border-slate-100 border-t-saffron-500 absolute inset-0"
                />
                <div className="absolute inset-3 rounded-full bg-saffron-50 animate-pulse" />
            </div>
            <div className="text-center">
                <p className="font-display font-semibold text-slate-700 text-sm">{text}</p>
                <p className="text-slate-400 text-xs font-body mt-1">कृपया प्रतीक्षा करा…</p>
            </div>
        </div>
    )
}