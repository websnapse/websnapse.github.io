/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#9B7AA0',
        secondary: '#FF7676',
      },
    },
  },
  plugins: [],
};
