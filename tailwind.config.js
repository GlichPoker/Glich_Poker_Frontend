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
      },
    },
  },
  plugins: [],
}