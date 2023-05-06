/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#9B7AA0',
        dark: '#210B2C',
        base: '#EDF2F4',
        secondary: '#D90429',
      },
    },
  },
  plugins: [],
};
