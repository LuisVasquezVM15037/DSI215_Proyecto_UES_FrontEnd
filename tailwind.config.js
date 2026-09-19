/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Primario — Azul clínico (confianza + tecnología)
        primary: {
          50:  '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        // Dental — Teal / Menta (salud + higiene)
        dental: {
          50:  '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
        },
        surface: {
          DEFAULT: '#f8fafc',
          card:    '#ffffff',
          subtle:  '#f1f5f9',
          border:  '#e2e8f0',
        },
      },
      fontFamily: {
        sans:    ['"Plus Jakarta Sans"', '"DM Sans"', 'system-ui', 'sans-serif'],
        display: ['"Outfit"', '"Syne"', 'sans-serif'],
      },
      animation: {
        'fade-in':      'fadeIn 0.25s ease-out',
        'fade-in-up':   'fadeInUp 0.35s ease-out',
        'fade-in-down': 'fadeInDown 0.3s ease-out',
        'scale-in':     'scaleIn 0.2s ease-out',
        'spin-slow':    'spin 2s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%':   { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInDown: {
          '0%':   { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%':   { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      boxShadow: {
        card:         '0 1px 3px 0 rgb(15 23 42 / 0.05), 0 1px 2px -1px rgb(15 23 42 / 0.05)',
        'card-md':    '0 4px 8px -1px rgb(15 23 42 / 0.06), 0 2px 4px -2px rgb(15 23 42 / 0.06)',
        'card-hover': '0 12px 24px -4px rgb(15 23 42 / 0.08), 0 4px 6px -2px rgb(15 23 42 / 0.04)',
        glass:        '0 8px 32px 0 rgba(15, 23, 42, 0.06)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
    },
  },
  plugins: [],
};
