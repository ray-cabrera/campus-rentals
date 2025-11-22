/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fff5ed',
          100: '#ffe8d5',
          200: '#feccaa',
          300: '#fda974',
          400: '#fc7a3c',
          500: '#fa5a16',
          600: '#FF6600', // Princeton Orange
          700: '#c23d00',
          800: '#9a3209',
          900: '#7c2b0a',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
