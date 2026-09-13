/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          linen: '#FAF9F5',
          card: '#FFFFFF',
          dark: '#1F2923',
          terracotta: '#C85A32',
          'terracotta-hover': '#B24B25',
          emerald: '#2D6A4F',
          'emerald-light': '#E8F5E9',
          amber: '#D97706',
          'amber-light': '#FEF3C7',
          stone: '#78716C',
          border: '#E7E5E4',
          muted: '#F5F4F0'
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
