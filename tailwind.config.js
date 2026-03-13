/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        background: '#0F0F10',
        surface: '#1A1A1B',
        'surface-light': '#252527',
        accent: '#3B82F6',
        'accent-dark': '#2563EB',
        'text-primary': '#FFFFFF',
        'text-secondary': '#9CA3AF',
        'text-muted': '#6B7280',
        border: '#2D2D2F',
        'status-purchased': '#6B7280',
        'status-technical-control': '#F97316',
        'status-bodywork': '#8B5CF6',
        'status-mechanic': '#EF4444',
        'status-cleaning': '#06B6D4',
        'status-ready': '#22C55E',
        'status-sold': '#10B981',
      },
    },
  },
  plugins: [],
};
