import { motion } from 'framer-motion'
import { ExternalLink, FileText, Building2, BadgeIndianRupee, ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { cn, CATEGORY_COLORS } from '@/lib/helpers.js'

export default function SchemeResultCard({ scheme, index = 0 }) {
    const name = scheme.name_en

    return (
        <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.06, ease: 'easeOut' }}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
            className="bg-white rounded-2xl shadow-card hover:shadow-card-hover border border-slate-100 overflow-hidden group transition-shadow duration-300"
        >
            {/* Accent bar */}
            <div className="h-1 bg-gradient-saffron group-hover:h-1.5 transition-all duration-300" />

            <div className="p-5">
                {/* Header row */}
                <div className="flex items-start justify-between gap-3 mb-3">
                    <h3 className="font-display font-semibold text-slate-800 text-sm leading-snug line-clamp-2 flex-1 group-hover:text-saffron-600 transition-colors">
                        {name}
                    </h3>
                    <span className={cn(
                        'shrink-0 text-xs font-display font-semibold px-2.5 py-1 rounded-full capitalize',
                        scheme.level === 'central'
                            ? 'bg-slate-100 text-slate-600'
                            : 'bg-saffron-50 text-saffron-700'
                    )}>
                        {scheme.level}
                    </span>
                </div>

                {/* Marathi name */}
                {scheme.name_mr && (
                    <p className="text-slate-400 text-xs marathi-font mb-2">{scheme.name_mr}</p>
                )}

                {/* Ministry */}
                <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-3 font-body">
                    <Building2 size={11} />
                    <span className="truncate">{scheme.ministry}</span>
                </div>

                {/* Categories */}
                <div className="flex flex-wrap gap-1.5 mb-3">
                    {scheme.category.slice(0, 3).map(cat => (
                        <span key={cat} className={cn('text-xs font-body font-medium px-2 py-0.5 rounded-full capitalize', CATEGORY_COLORS[cat] || 'bg-gray-100 text-gray-600')}>
                            {cat}
                        </span>
                    ))}
                </div>

                {/* Description */}
                <p className="text-slate-500 text-xs font-body leading-relaxed line-clamp-2 mb-3">
                    {scheme.benefit_description}
                </p>

                {/* Benefit amount */}
                {scheme.benefit_amount && (
                    <div className="flex items-center gap-2 bg-forest-50 rounded-xl px-3 py-2 mb-4 border border-forest-100">
                        <BadgeIndianRupee size={13} className="text-forest-600 shrink-0" />
                        <span className="text-forest-700 text-xs font-display font-semibold truncate">{scheme.benefit_amount}</span>
                    </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 text-slate-400 text-xs font-body">
                        <FileText size={11} />
                        <span>{scheme.documents_required?.length || 0} docs needed</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link
                            to={`/schemes/${scheme._id}`}
                            className="flex items-center gap-1 text-saffron-600 text-xs font-display font-semibold hover:text-saffron-700 transition-colors"
                        >
                            Details <ChevronRight size={12} />
                        </Link>
                        {scheme.apply_link && (
                            <a
                                href={scheme.apply_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 bg-gradient-saffron text-white text-xs font-display font-semibold px-3 py-1.5 rounded-lg hover:shadow-warm hover:scale-105 transition-all duration-200"
                            >
                                Apply <ExternalLink size={10} />
                            </a>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    )
}