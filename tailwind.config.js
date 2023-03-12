/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./popup/**/*.{html,js}"],
  theme: {
    extend: {
      colors: {
        'malachite': {
          '50': '#e7fee7',
          '100': '#cbfccc',
          '200': '#9ef8a1',
          '300': '#65f16d',
          '400': '#21e22f',
          '500': '#17cb27',
          '600': '#0ea21e',
          '700': '#107b1d',
          '800': '#13611d',
          '900': '#14531e',
        },
      }
    },
  },
  plugins: [],
}
