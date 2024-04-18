/** @type {import('tailwindcss').Config} */
const colors = require('tailwindcss/colors')

module.exports = {
    content: [
        "./src/**/*.{js,jsx,ts,tsx}",
      ],
  theme: {
    patterns: {
      opacities: {
          100: "1",
          80: ".80",
          60: ".60",
          40: ".40",
          20: ".20",
          10: ".10",
          5: ".05",
      },
      sizes: {
          1: "0.25rem",
          2: "0.5rem",
          3: "0.75rem",
          4: "1rem",
          5: "1.25",
          6: "1.5rem",
          8: "2rem",
          16: "4rem",
          20: "5rem",
          24: "6rem",
          32: "8rem",
      }
  },
      extend: {
          colors: {
              'umbra': '#9BA679',
          },
          borderRadius: {
              'large': '30px',
          },
          boxShadow: {
              '3xl': 'rgb(38, 57, 77) 0px 20px 30px -10px;',
              '1xl': 'rgba(0, 0, 0, 0.07) 0px 1px 2px, rgba(0, 0, 0, 0.07) 0px 2px 4px, rgba(0, 0, 0, 0.07) 0px 4px 8px, rgba(0, 0, 0, 0.07) 0px 8px 16px, rgba(0, 0, 0, 0.07) 0px 16px 32px, rgba(0, 0, 0, 0.07) 0px 32px 64px;'
            },
          fontFamily: {
              'hedwig': ['Hedwig Letters', 'serif'],
              'lemon-tuesday': ['Lemon Tuesday', 'cursive']
          },
          animation: {
            fade: 'fadeIn .5s ease-in-out',
          },

          keyframes: {
              fadeIn: {
                  from: { opacity: 0 },
                  to: { opacity: 1 },
              },
          },
      },
  },
plugins: [
      require('tailwindcss-dotted-background'),
      require('tailwindcss-bg-patterns'),
],
}

