/** @type {import('tailwindcss').Config} */
const colors = require('tailwindcss/colors');

module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        umbra: '#9BA679',
      },
      borderRadius: {
        large: '30px',
      },
      boxShadow: {
        '1xl': 'rgba(0, 0, 0, 0.1) 0px 4px 12px',
        '3xl-rounded': '0 4px 10px rgba(0, 0, 0, 0.25)',
      },
      fontFamily: {
        hedwig: ['Hedwig Letters', 'serif'],
        'lemon-tuesday': ['Lemon Tuesday', 'cursive'],
      },
      animation: {
        'fade-in': 'fade-in .75s ease-in-out forwards',
        'fade-out': 'fade-out 0.5s ease-in-out forwards',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
        'fade-out': {
          '0%': { opacity: 1 },
          '100%': { opacity: 0 },
        },
      },
    },
  },
  plugins: [
    require('tailwindcss-dotted-background'),
    require('tailwindcss-bg-patterns'),
    ({ addUtilities }) => {
      addUtilities(
        {
          '.menu-scrollbar-hide': {
            '-ms-overflow-style': 'none',
            'scrollbar-width': 'none',
            '&::-webkit-scrollbar': {
              display: 'none',
            },
          },
        },
        ['responsive', 'hover']
      );
    },
  ],
};

