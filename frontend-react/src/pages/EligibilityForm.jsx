import { useState, forwardRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { ArrowLeft, ArrowRight, CheckCircle2, Sparkles, User, Wallet, Users, Heart } from 'lucide-react'
import apiClient from '@/lib/apiClient.js'
import { SCHEME_CATEGORIES } from '@/lib/helpers.js'
import ChoiceButton from '@/components/ui/ChoiceButton.jsx'

/* ── Validation schema ───────────────────────────────────── */
const schema = z.object({
    age: z.number({ invalid_type_error: 'Enter your age' }).min(1, 'Age is required').max(120, 'Age must be 120 or less'),
    gender: z.string().min(1, 'Select your gender'),
    annual_income: z.number({ invalid_type_error: 'Enter annual income' }).min(0, 'Income must be 0 or more').default(0),
    caste: z.string().min(1, 'Select your category').default('general'),
    bpl: z.boolean().default(false),
    marital_status: z.string().min(1, 'Select marital status').default('any'),
    disability: z.boolean().default(false),
    categories: z.array(z.string()).min(1, 'Select at least one area').default([]),
})

const STEPS = [
    { id: 1, title: 'Personal Details', subtitle: 'वैयक्तिक माहिती', icon: User },
    { id: 2, title: 'Income & BPL', subtitle: 'उत्पन्न माहिती', icon: Wallet },
    { id: 3, title: 'Background', subtitle: 'सामाजिक माहिती', icon: Users },
    { id: 4, title: 'What do you need?', subtitle: 'तुम्हाला काय हवे?', icon: Heart },
]

const slideVariants = {
    enter: (d) => ({ opacity: 0, x: d > 0 ? 70 : -70 }),
    center: { opacity: 1, x: 0 },
    exit: (d) => ({ opacity: 0, x: d > 0 ? -70 : 70 }),
}

/* ── Text input ──────────────────────────────────────────── */
const TextInput = forwardRef(function TextInput({ label, sublabel, error, ...props }, ref) {
    return (
        <div className="space-y-1.5">
            <label className="block text-sm font-display font-semibold text-slate-800">
                {label}
                {sublabel && <span className="ml-2 text-slate-400 font-body text-xs marathi-font">{sublabel}</span>}
            </label>
            <input
                ref={ref}
                {...props}
                className={`w-full px-4 py-3 rounded-xl border-2 font-body text-slate-800 text-sm outline-none transition-all duration-200 bg-white ${error ? 'border-red-400 focus:border-red-500' : 'border-slate-200 focus:border-saffron-500 hover:border-slate-300'
                    }`}
            />
            {error && <p className="text-red-500 text-xs font-body">{error}</p>}
        </div>
    )
})

export default function EligibilityForm() {
    const navigate = useNavigate()
    const [step, setStep] = useState(1)
    const [dir, setDir] = useState(1)
    const [busy, setBusy] = useState(false)

    const { register, handleSubmit, watch, setValue, trigger, formState: { errors } } = useForm({
        resolver: zodResolver(schema),
        defaultValues: { bpl: false, disability: false, categories: [], marital_status: 'any', gender: '', caste: '' },
    })
    const vals = watch()

    const stepFields = {
        1: ['age', 'gender'],
        2: ['annual_income'],
        3: ['caste', 'marital_status'],
        4: ['categories'],
    }

    const goNext = async () => {
        const ok = await trigger(stepFields[step])
        if (!ok) return
        setDir(1)
        setStep(s => s + 1)
    }

    const goBack = () => { setDir(-1); setStep(s => s - 1) }

    const toggleCategory = (val) => {
        const cur = vals.categories || []
        setValue('categories', cur.includes(val) ? cur.filter(c => c !== val) : [...cur, val], { shouldValidate: true })
    }

    const onSubmit = async (data) => {
        setBusy(true)
        try {
            const res = await apiClient.post('/api/schemes/check', data)
            sessionStorage.setItem('eligibilityResult', JSON.stringify(res.data.data))
            toast.success(`${res.data.data.matched_count} schemes found for you!`)
            navigate('/results')
        } catch {
            toast.error('Something went wrong. Please try again.')
        } finally {
            setBusy(false)
        }
    }

    return (
        <div className="min-h-screen bg-cream pt-24 pb-16">
            <div className="max-w-2xl mx-auto px-4 sm:px-6">

                {/* Header */}
                <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
                    <div className="inline-flex items-center gap-2 bg-slate-100 rounded-full px-4 py-1.5 mb-4">
                        <Sparkles size={12} className="text-saffron-500" />
                        <span className="text-slate-600 text-xs font-body font-medium">Free · Takes 60 seconds</span>
                    </div>
                    <h1 className="font-display font-black text-3xl sm:text-4xl text-slate-900 mb-2">Check Your Eligibility</h1>
                    <p className="text-slate-500 font-body text-sm marathi-font">पात्रता तपासा</p>
                </motion.div>

                {/* Progress bar */}
                <div className="mb-8">
                    <div className="flex items-center gap-2 mb-2">
                        {STEPS.map((s, i) => {
                            const Icon = s.icon
                            const done = step > s.id
                            const active = step === s.id
                            return (
                                <div key={s.id} className="flex items-center gap-2 flex-1">
                                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300 ${done ? 'bg-forest-600 shadow-green' : active ? 'bg-gradient-saffron shadow-warm' : 'bg-slate-200'
                                        }`}>
                                        {done
                                            ? <CheckCircle2 size={14} className="text-white" />
                                            : <Icon size={13} className={active ? 'text-white' : 'text-slate-400'} />
                                        }
                                    </div>
                                    {i < STEPS.length - 1 && (
                                        <div className="flex-1 h-1 rounded-full bg-slate-200 overflow-hidden">
                                            <motion.div
                                                className="h-full bg-gradient-saffron rounded-full"
                                                animate={{ width: step > s.id ? '100%' : '0%' }}
                                                transition={{ duration: 0.4 }}
                                            />
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                    <div className="flex justify-between mt-1 hidden sm:flex">
                        {STEPS.map(s => (
                            <span key={s.id} className={`text-xs font-body transition-colors ${step === s.id ? 'text-saffron-600 font-semibold' : 'text-slate-400'}`}>
                                {s.title}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Card */}
                <div className="bg-white rounded-3xl shadow-card-hover border border-slate-100 overflow-hidden">
                    {/* Card header */}
                    <div className="bg-gradient-dark px-6 py-4 flex items-center gap-3">
                        {(() => { const S = STEPS[step - 1]; return <S.icon size={15} className="text-saffron-400" /> })()}
                        <div>
                            <h2 className="font-display font-semibold text-white text-sm">{STEPS[step - 1].title}</h2>
                            <p className="text-white/40 text-xs marathi-font">{STEPS[step - 1].subtitle}</p>
                        </div>
                        <span className="ml-auto text-white/30 text-xs font-body">Step {step}/{STEPS.length}</span>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)}>
                        <div className="p-6 sm:p-8 min-h-[320px]">
                            <AnimatePresence mode="wait" custom={dir}>
                                <motion.div
                                    key={step}
                                    custom={dir}
                                    variants={slideVariants}
                                    initial="enter"
                                    animate="center"
                                    exit="exit"
                                    transition={{ duration: 0.28, ease: 'easeInOut' }}
                                >

                                    {/* Step 1 */}
                                    {step === 1 && (
                                        <div className="space-y-5">
                                            <TextInput
                                                label="Your Age" sublabel="तुमचे वय"
                                                type="number" placeholder="e.g. 28"
                                                error={errors.age?.message}
                                                {...register('age', { valueAsNumber: true })}
                                            />
                                            <div className="space-y-2">
                                                <label className="block text-sm font-display font-semibold text-slate-800">
                                                    Gender <span className="text-slate-400 font-body text-xs marathi-font ml-1">लिंग</span>
                                                </label>
                                                <div className="grid grid-cols-2 gap-2">
                                                    {[
                                                        { value: 'male', label: 'Male', sublabel: 'पुरुष', emoji: '👨' },
                                                        { value: 'female', label: 'Female', sublabel: 'महिला', emoji: '👩' },
                                                        { value: 'transgender', label: 'Transgender', sublabel: 'तृतीयपंथी', emoji: '🏳️‍🌈' },
                                                        { value: 'all', label: 'Prefer not', sublabel: 'सांगणे नको', emoji: '👤' },
                                                    ].map(opt => (
                                                        <ChoiceButton key={opt.value} {...opt}
                                                            selected={vals.gender === opt.value}
                                                            onClick={() => setValue('gender', opt.value, { shouldValidate: true })}
                                                        />
                                                    ))}
                                                </div>
                                                {errors.gender && <p className="text-red-500 text-xs">{errors.gender.message}</p>}
                                            </div>
                                        </div>
                                    )}

                                    {/* Step 2 */}
                                    {step === 2 && (
                                        <div className="space-y-5">
                                            <TextInput
                                                label="Annual Family Income (₹)" sublabel="वार्षिक कौटुंबिक उत्पन्न"
                                                type="number" placeholder="e.g. 120000"
                                                error={errors.annual_income?.message}
                                                {...register('annual_income', { valueAsNumber: true })}
                                            />
                                            <div className="space-y-2">
                                                <label className="block text-sm font-display font-semibold text-slate-800">
                                                    Are you a BPL cardholder? <span className="text-slate-400 font-body text-xs marathi-font ml-1">BPL कार्डधारक?</span>
                                                </label>
                                                <div className="grid grid-cols-2 gap-2">
                                                    {[
                                                        { value: true, label: 'Yes, BPL', sublabel: 'होय', emoji: '✅' },
                                                        { value: false, label: 'No, I am not', sublabel: 'नाही', emoji: '❌' },
                                                    ].map(opt => (
                                                        <ChoiceButton key={String(opt.value)} {...opt}
                                                            selected={vals.bpl === opt.value}
                                                            onClick={() => setValue('bpl', opt.value)}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Step 3 */}
                                    {step === 3 && (
                                        <div className="space-y-5">
                                            <div className="space-y-2">
                                                <label className="block text-sm font-display font-semibold text-slate-800">
                                                    Caste Category <span className="text-slate-400 font-body text-xs marathi-font ml-1">जात श्रेणी</span>
                                                </label>
                                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                                    {[
                                                        { value: 'general', label: 'General', sublabel: 'सामान्य' },
                                                        { value: 'obc', label: 'OBC', sublabel: 'इतर मागास' },
                                                        { value: 'sc', label: 'SC', sublabel: 'अनुसूचित जाती' },
                                                        { value: 'st', label: 'ST', sublabel: 'अनुसूचित जमाती' },
                                                        { value: 'nt', label: 'NT', sublabel: 'भटक्या जमाती' },
                                                        { value: 'vjnt', label: 'VJNT', sublabel: 'विमुक्त जाती' },
                                                    ].map(opt => (
                                                        <ChoiceButton key={opt.value} {...opt}
                                                            selected={vals.caste === opt.value}
                                                            onClick={() => setValue('caste', opt.value, { shouldValidate: true })}
                                                        />
                                                    ))}
                                                </div>
                                                {errors.caste && <p className="text-red-500 text-xs">{errors.caste.message}</p>}
                                            </div>
                                            <div className="space-y-2">
                                                <label className="block text-sm font-display font-semibold text-slate-800">
                                                    Marital Status <span className="text-slate-400 font-body text-xs marathi-font ml-1">वैवाहिक स्थिती</span>
                                                </label>
                                                <div className="grid grid-cols-2 gap-2">
                                                    {[
                                                        { value: 'single', label: 'Single', emoji: '🙋' },
                                                        { value: 'married', label: 'Married', emoji: '💑' },
                                                        { value: 'widow', label: 'Widow/Widower', emoji: '🕯️' },
                                                        { value: 'any', label: 'Prefer not', emoji: '🔒' },
                                                    ].map(opt => (
                                                        <ChoiceButton key={opt.value} {...opt}
                                                            selected={vals.marital_status === opt.value}
                                                            onClick={() => setValue('marital_status', opt.value, { shouldValidate: true })}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="block text-sm font-display font-semibold text-slate-800">
                                                    Disability (40%+)? <span className="text-slate-400 font-body text-xs marathi-font ml-1">अपंगत्व?</span>
                                                </label>
                                                <div className="grid grid-cols-2 gap-2">
                                                    {[{ value: true, label: 'Yes', emoji: '♿' }, { value: false, label: 'No', emoji: '🚶' }].map(opt => (
                                                        <ChoiceButton key={String(opt.value)} {...opt}
                                                            selected={vals.disability === opt.value}
                                                            onClick={() => setValue('disability', opt.value)}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Step 4 */}
                                    {step === 4 && (
                                        <div className="space-y-4">
                                            <p className="text-slate-500 text-sm font-body">
                                                Select all that apply <span className="marathi-font">— एकापेक्षा जास्त निवडा</span>
                                            </p>
                                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                                                {SCHEME_CATEGORIES.map(cat => {
                                                    const sel = (vals.categories || []).includes(cat.value)
                                                    return (
                                                        <motion.button
                                                            key={cat.value}
                                                            type="button"
                                                            onClick={() => toggleCategory(cat.value)}
                                                            whileTap={{ scale: 0.96 }}
                                                            className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border-2 transition-all duration-200 text-center ${sel
                                                                    ? 'border-saffron-500 bg-saffron-50 shadow-warm/20 shadow-sm'
                                                                    : 'border-slate-200 bg-white hover:border-saffron-300 hover:bg-saffron-50/30'
                                                                }`}
                                                        >
                                                            <span className="text-2xl">{cat.emoji}</span>
                                                            <span className={`text-xs font-display font-semibold ${sel ? 'text-saffron-700' : 'text-slate-700'}`}>{cat.label}</span>
                                                            <span className="text-slate-400 text-xs marathi-font">{cat.label_mr}</span>
                                                        </motion.button>
                                                    )
                                                })}
                                            </div>
                                            {errors.categories && <p className="text-red-500 text-xs">{errors.categories.message}</p>}
                                        </div>
                                    )}

                                </motion.div>
                            </AnimatePresence>
                        </div>

                        {/* Navigation */}
                        <div className="px-6 sm:px-8 pb-7 flex items-center justify-between gap-4 border-t border-slate-100 pt-5">
                            <button
                                type="button"
                                onClick={goBack}
                                disabled={step === 1}
                                className="flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-slate-200 text-slate-500 font-display font-semibold text-sm hover:border-slate-400 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                            >
                                <ArrowLeft size={15} /> Back
                            </button>

                            {step < STEPS.length ? (
                                <button
                                    type="button"
                                    onClick={goNext}
                                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-saffron text-white font-display font-bold text-sm shadow-warm hover:shadow-warm-lg hover:scale-105 transition-all duration-200"
                                >
                                    Next <ArrowRight size={15} />
                                </button>
                            ) : (
                                <motion.button
                                    type="submit"
                                    disabled={busy}
                                    whileTap={{ scale: 0.97 }}
                                    className="flex items-center gap-2 px-8 py-2.5 rounded-xl bg-gradient-saffron text-white font-display font-bold text-sm shadow-warm hover:shadow-warm-lg disabled:opacity-70 disabled:cursor-not-allowed transition-all min-w-[150px] justify-center"
                                >
                                    {busy ? (
                                        <>
                                            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                                className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                                            />
                                            Searching…
                                        </>
                                    ) : (
                                        <><Sparkles size={15} /> Find My Schemes</>
                                    )}
                                </motion.button>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}