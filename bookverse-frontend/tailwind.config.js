/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        deepPurple: "#635985",
        darkPurple: "#443C68",
        spacePurple: "#393053",
        nightBlack: "#18122B",
        darkBlue: "#001C30",
        teal: "#176B87",
        aqua: "#64CCC5",
        ice: "#DAFFFB",
        charcoalBlue: "#242038",
        darkColor: "#0d0633",
      },
      fontFamily: {
  sans: ["Inter", "sans-serif"],
}

    },
  },
  plugins: [],
};
