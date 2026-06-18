import { motion } from 'framer-motion'
import { CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/helpers.js'

export default function ChoiceButton({ label, sublabel, emoji, selected, onClick }) {
    return (
        <motion.button
            type="button"
            onClick={onClick}
            whileTap={{ scale: 0.96 }}
            className={cn(
                'relative w-full flex items-center gap-3 p-3.5 rounded-2xl border-2 text-left transition-all duration-200',
                selected
                    ? 'border-saffron-500 bg-saffron-50 shadow-warm/30 shadow-md'
                    : 'border-slate-200 bg-white hover:border-saffron-300 hover:bg-saffron-50/30'
            )}
        >
            {emoji && <span className="text-xl shrink-0">{emoji}</span>}
            <div className="flex-1 min-w-0">
                <span className={cn('text-sm font-display font-semibold block', selected ? 'text-saffron-700' : 'text-slate-800')}>
                    {label}
                </span>
                {sublabel && (
                    <span className="text-xs font-body text-slate-400 block mt-0.5 marathi-font">{sublabel}</span>
                )}
            </div>
            {selected && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 450 }}>
                    <CheckCircle2 size={16} className="text-saffron-500 shrink-0" />
                </motion.div>
            )}
        </motion.button>
    )
}