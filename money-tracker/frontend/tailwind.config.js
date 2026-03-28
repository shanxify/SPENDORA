/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          bg: '#0A0A0F',
        },
        secondary: {
          bg: '#111118',
        },
        card: {
          DEFAULT: '#16161F',
          hover: '#1C1C28'
        },
        accent: {
          DEFAULT: '#7C6FCD',
          light: '#9D93D8',
          glow: 'rgba(124, 111, 205, 0.15)'
        },
        success: {
          DEFAULT: '#22C55E',
          bg: 'rgba(34, 197, 94, 0.1)',
        },
        danger: {
          DEFAULT: '#EF4444',
          bg: 'rgba(239, 68, 68, 0.1)',
        },
        warning: {
          DEFAULT: '#F59E0B',
          bg: 'rgba(245, 158, 11, 0.1)',
        },
        text: {
          primary: '#F0F0F8',
          secondary: '#A0A0B8',
          muted: '#606080'
        },
        border: {
          DEFAULT: '#22222E',
          light: '#2A2A3A'
        }
      },
      fontFamily: {
        syne: ['Syne', 'sans-serif'],
        sans: ['DM Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      }
    },
  },
  plugins: [],
}
