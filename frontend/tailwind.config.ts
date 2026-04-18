import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Brand
        primary: {
          DEFAULT: '#7C3AED',
          50:  '#F5F3FF',
          100: '#EDE9FE',
          200: '#DDD6FE',
          300: '#C4B5FD',
          400: '#A78BFA',
          500: '#8B5CF6',
          600: '#7C3AED',
          700: '#6D28D9',
          800: '#5B21B6',
          900: '#4C1D95',
        },
        accent: {
          DEFAULT: '#3B82F6',
          400: '#60A5FA',
          500: '#3B82F6',
          600: '#2563EB',
        },
        // Surface
        surface: {
          DEFAULT: 'rgba(255,255,255,0.04)',
          hover: 'rgba(255,255,255,0.07)',
          border: 'rgba(255,255,255,0.08)',
          strong: 'rgba(255,255,255,0.10)',
        },
        // Background tiers
        bg: {
          base:    '#0A0A0F',
          elevated:'#111118',
          card:    '#16161F',
        },
        success: '#10B981',
        warning: '#F59E0B',
        danger:  '#EF4444',
        // Token colors
        usdc:  '#2775CA',
        matic: '#8247E5',
        eth:   '#627EEA',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'fade-in':    'fadeIn 0.4s ease-out',
        'slide-up':   'slideUp 0.4s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'spin-slow':  'spin 3s linear infinite',
        'bounce-soft':'bounceSoft 1s ease-in-out infinite',
        'scan-line':  'scanLine 2s linear infinite',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          from: { opacity: '0', transform: 'translateY(-16px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(124,58,237,0.3)' },
          '50%':      { boxShadow: '0 0 40px rgba(124,58,237,0.6)' },
        },
        bounceSoft: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(-6px)' },
        },
        scanLine: {
          from: { transform: 'translateY(-100%)' },
          to:   { transform: 'translateY(300%)' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'purple-glow':     'radial-gradient(ellipse at top, rgba(124,58,237,0.15) 0%, transparent 70%)',
        'blue-glow':       'radial-gradient(ellipse at bottom, rgba(59,130,246,0.10) 0%, transparent 70%)',
        'hero-gradient':   'linear-gradient(135deg, #0A0A0F 0%, #0F0A1A 50%, #0A0F1A 100%)',
        'card-gradient':   'linear-gradient(135deg, rgba(124,58,237,0.1) 0%, rgba(59,130,246,0.05) 100%)',
        'success-gradient':'linear-gradient(135deg, rgba(16,185,129,0.15) 0%, rgba(16,185,129,0.05) 100%)',
        'brand-gradient':  'linear-gradient(135deg, #7C3AED 0%, #3B82F6 100%)',
      },
      boxShadow: {
        'glow-sm':     '0 0 15px rgba(124,58,237,0.25)',
        'glow-md':     '0 0 30px rgba(124,58,237,0.35)',
        'glow-lg':     '0 0 60px rgba(124,58,237,0.45)',
        'card':        '0 4px 24px rgba(0,0,0,0.4)',
        'card-hover':  '0 8px 40px rgba(0,0,0,0.6)',
        'inner-glow':  'inset 0 1px 0 rgba(255,255,255,0.08)',
      },
    },
  },
  plugins: [],
};

export default config;
