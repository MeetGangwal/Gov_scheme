import { clsx } from 'clsx'

// Merge Tailwind classes safely
export function cn(...inputs) {
    return clsx(inputs)
}

// Scheme categories with emoji, English and Marathi labels
export const SCHEME_CATEGORIES = [
    { value: 'health', label: 'Health', label_mr: 'आरोग्य', emoji: '🏥' },
    { value: 'education', label: 'Education', label_mr: 'शिक्षण', emoji: '📚' },
    { value: 'agriculture', label: 'Agriculture', label_mr: 'शेती', emoji: '🌾' },
    { value: 'housing', label: 'Housing', label_mr: 'घर', emoji: '🏠' },
    { value: 'employment', label: 'Employment', label_mr: 'रोजगार', emoji: '💼' },
    { value: 'women', label: 'Women', label_mr: 'महिला', emoji: '👩' },
    { value: 'finance', label: 'Finance', label_mr: 'वित्त', emoji: '💰' },
    { value: 'pension', label: 'Pension', label_mr: 'पेन्शन', emoji: '👴' },
    { value: 'disability', label: 'Disability', label_mr: 'अपंग', emoji: '♿' },
    { value: 'child', label: 'Child', label_mr: 'बाल', emoji: '👶' },
    { value: 'elderly', label: 'Elderly', label_mr: 'वृद्ध', emoji: '🧓' },
]

// Category colour map
export const CATEGORY_COLORS = {
    health: 'bg-red-100 text-red-700',
    education: 'bg-blue-100 text-blue-700',
    agriculture: 'bg-green-100 text-green-700',
    housing: 'bg-purple-100 text-purple-700',
    employment: 'bg-orange-100 text-orange-700',
    women: 'bg-pink-100 text-pink-700',
    finance: 'bg-yellow-100 text-yellow-700',
    pension: 'bg-gray-100 text-gray-700',
    disability: 'bg-indigo-100 text-indigo-700',
    child: 'bg-teal-100 text-teal-700',
    elderly: 'bg-amber-100 text-amber-700',
}

// Format Indian rupee
export const formatINR = (amount) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount)