/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        saffron: {
          50: '#FFF7ED',
          100: '#FFEDD5',
          200: '#FED7AA',
          300: '#FDBA74',
          400: '#FB923C',
          500: '#F97316',
          600: '#EA6C0A',
          700: '#C2550A',
          800: '#9A4409',
          900: '#7C3A0A',
        },
        forest: {
          50: '#F0FDF4',
          100: '#DCFCE7',
          200: '#BBF7D0',
          300: '#86EFAC',
          400: '#4ADE80',
          500: '#22C55E',
          600: '#15803D',
          700: '#166534',
          800: '#14532D',
          900: '#052E16',
        },
        slate: {
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B',
          600: '#475569',
          700: '#334155',
          800: '#1E293B',
          900: '#0F172A',
        },
        cream: '#FAFAF7',
        gold: '#FCD34D',
      },
      fontFamily: {
        display: ['"Poppins"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
        devanagari: ['"Noto Sans Devanagari"', 'sans-serif'],
      },
      boxShadow: {
        'warm': '0 4px 24px rgba(249,115,22,0.18)',
        'warm-lg': '0 8px 48px rgba(249,115,22,0.28)',
        'card': '0 2px 16px rgba(30,41,59,0.08)',
        'card-hover': '0 8px 40px rgba(30,41,59,0.16)',
        'green': '0 4px 24px rgba(21,128,61,0.2)',
      },
      animation: {
        'float': 'float 5s ease-in-out infinite',
        'float-slow': 'float 7s ease-in-out 1s infinite',
        'shimmer': 'shimmer 2.5s linear infinite',
        'fade-up': 'fadeUp 0.5s ease forwards',
        'scale-in': 'scaleIn 0.4s ease forwards',
        'spin-slow': 'spin 10s linear infinite',
      },
      keyframes: {
        float: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-16px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-400px 0' },
          '100%': { backgroundPosition: '400px 0' },
        },
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(24px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          from: { opacity: '0', transform: 'scale(0.92)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
      },
      backgroundImage: {
        'gradient-saffron': 'linear-gradient(135deg,#F97316 0%,#EA6C0A 100%)',
        'gradient-forest': 'linear-gradient(135deg,#15803D 0%,#166534 100%)',
        'gradient-dark': 'linear-gradient(135deg,#0F172A 0%,#1E293B 60%,#334155 100%)',
        'gradient-warm': 'linear-gradient(135deg,#FFF7ED 0%,#FAFAF7 100%)',
        'shimmer-line': 'linear-gradient(90deg,transparent 0%,rgba(255,255,255,0.15) 50%,transparent 100%)',
      },
    },
  },
  plugins: [],
}