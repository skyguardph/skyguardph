/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './node_modules/react-tailwindcss-select/dist/index.esm.js',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#800000', // maroon
          light: '#A52A2A',
          dark: '#4A0000',
        },
        secondary: {
          DEFAULT: '#2E7D32', // green
          light: '#4CAF50',
          dark: '#1B5E20',
        },
        background: {
          light: '#F8F8F8',
          dark: '#1A1A1A',
        },
      },
    },
  },
  plugins: [require('@tailwindcss/forms'), require('@tailwindcss/typography')],
  darkMode: 'class',
}
