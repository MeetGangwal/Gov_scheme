import { Link } from 'react-router-dom'
import { Heart, Github, Shield, Sparkles } from 'lucide-react'

export default function SiteFooter() {
    return (
        <footer className="bg-slate-900 text-white/55 py-12 mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">

                    {/* Brand */}
                    <div className="md:col-span-2">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-9 h-9 rounded-xl bg-gradient-saffron flex items-center justify-center shadow-warm">
                                <span className="text-white font-bold text-base marathi-font">य</span>
                            </div>
                            <div>
                                <p className="font-display font-bold text-white text-base leading-tight">Yojana Setu</p>
                                <p className="text-white/35 text-xs marathi-font">योजना सेतू</p>
                            </div>
                        </div>
                        <p className="text-sm font-body leading-relaxed max-w-xs text-white/45">
                            Bridging Maharashtra citizens with government schemes they deserve — in their language, in minutes.
                        </p>
                        <div className="flex items-center gap-2 mt-4 text-xs">
                            <Shield size={11} className="text-forest-400" />
                            <span className="text-white/35">Secure · DevSecOps Protected · Open Source</span>
                        </div>
                    </div>

                    {/* Links */}
                    <div>
                        <h4 className="font-display font-semibold text-white text-sm mb-4">Navigate</h4>
                        <ul className="space-y-2.5 text-sm font-body">
                            {[['/', 'Home'], ['/check', 'Check Eligibility'], ['/schemes', 'All Schemes'], ['/search', 'AI Search']].map(([to, label]) => (
                                <li key={to}><Link to={to} className="hover:text-saffron-400 transition-colors">{label}</Link></li>
                            ))}
                        </ul>
                    </div>

                    {/* Categories */}
                    <div>
                        <h4 className="font-display font-semibold text-white text-sm mb-4">By Category</h4>
                        <ul className="space-y-2.5 text-sm font-body">
                            {['Health', 'Education', 'Agriculture', 'Housing', 'Employment', 'Women'].map(cat => (
                                <li key={cat}>
                                    <Link to={`/schemes?category=${cat.toLowerCase()}`} className="hover:text-saffron-400 transition-colors">{cat}</Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="border-t border-white/8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-body">
                    <p className="flex items-center gap-1.5">
                        Made with <Heart size={11} className="text-saffron-500 fill-saffron-500" /> for Maharashtra
                        <span className="text-white/25 mx-1">·</span>
                        <Sparkles size={11} className="text-saffron-500" /> MCA DevOps Project
                    </p>
                    <div className="flex items-center gap-4 text-white/35">
                        <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-white flex items-center gap-1 transition-colors">
                            <Github size={12} /> GitHub
                        </a>
                        <span>© 2025 Yojana Setu</span>
                    </div>
                </div>
            </div>
        </footer>
    )
}