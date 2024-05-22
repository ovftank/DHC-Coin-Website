/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./public/**/*.html",
    "./public/*.html",
    "./public/*.html",
    "./admin/*.html",
    "./admin/*.html",
    "./*.js",
    "./**/*.js",
  ],
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
