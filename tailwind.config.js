/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'denr-green': '#2E7D32',
        'denr-dark': '#14532D',
        'denr-light': '#DCFEAA',
        'denr-bg': '#F0FDF4',
        'denr-border': '#E5E7EB',
      },
      fontFamily: {
        'denr': ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
