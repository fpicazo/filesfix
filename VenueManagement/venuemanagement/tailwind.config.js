/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["inter", "sans-serif"],
      },
      colors: {
        primary: {
          DEFAULT: "#240046", // Indigo-700
          dark: "#a855f7", // Indigo-800
          light: "#7e22ce", // Indigo-500
        },
        textLight:"#8E8C8F",
        textDark:"#030712"
      },
    },
  },
  plugins: [],
};
