/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          bg: '#060010',
        },
        secondary: {
          bg: '#0a0a14',
        },
        card: {
          DEFAULT: '#0c0c14',
          hover: '#12121c'
        },
        accent: {
          DEFAULT: '#7c3aed',
          light: '#8b5cf6',
          glow: 'rgba(124, 58, 237, 0.15)'
        },
        success: {
          DEFAULT: '#22c55e',
          bg: 'rgba(34, 197, 94, 0.1)',
        },
        danger: {
          DEFAULT: '#ef4444',
          bg: 'rgba(239, 68, 68, 0.1)',
        },
        warning: {
          DEFAULT: '#f59e0b',
          bg: 'rgba(245, 158, 11, 0.1)',
        },
        text: {
          primary: '#ffffff',
          secondary: '#9ca3af',
          muted: '#6b7280'
        },
        border: {
          DEFAULT: 'rgba(255,255,255,0.08)',
          light: 'rgba(255,255,255,0.1)'
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      }
    },
  },
  plugins: [],
}
