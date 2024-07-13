/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'my-font': ['"My Font"', 'sans-serif'],
      },

    },
  },
  plugins: [

  ],
  darkMode: 'class',
}
