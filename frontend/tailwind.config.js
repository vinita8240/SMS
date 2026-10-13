/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f4f3fb',
          100: '#ebe8f7',
          200: '#dcd6f1',
          300: '#c2b6e6',
          400: '#9d88d6',
          500: '#705ec8', // Smart School primary purple
          600: '#5d4cb0',
          700: '#4e3f94',
          800: '#42377b',
          900: '#382f65',
          950: '#221b42',
        },
        slate: {
          850: '#151f32',
          900: '#0f172a',
          950: '#020617',
        }
      },
      fontFamily: {
        sans: ['Segoe UI', 'Roboto', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'ss': '0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.03)',
        'card': '0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.03)',
      }
    },
  },
  plugins: [],
}
