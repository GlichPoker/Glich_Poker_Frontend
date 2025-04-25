/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}', // all files in app directory
    './pages/**/*.{js,ts,jsx,tsx,mdx}', // all files in pages directory
    './components/**/*.{js,ts,jsx,tsx,mdx}', // all files in components directory
  ],
  theme: {
    extend: {
      colors: {
        // You can define custom colors here if needed
        zinc: {
          900: '#18181b',
          800: '#27272a',
          700: '#3f3f46',
          600: '#52525b',
          500: '#71717a',
          400: '#a1a1aa',
          300: '#d4d4d8',
          200: '#e4e4e7',
          100: '#f4f4f5',
          50: '#fafafa',
        },
      },
    },
  },
  plugins: [],
}