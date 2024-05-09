/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./public/**/*.ejs", "./public/*.ejs"],
  important: true,
  theme: {
    extend: {},
    fontFamily: {
      sans: ["DM Sans", "sans-serif"],
      serif: ["Helvetica Neue", "sans-serif"],
    },
  },
  plugins: [],
};
