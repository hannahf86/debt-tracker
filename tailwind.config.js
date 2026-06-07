/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Atkinson Hyperlegible", "sans-serif"],
      },
      colors: {
        sage: {
          50: "#f0f4f2",
          100: "#dce5e1",
          200: "#bdd0c8",
          300: "#a7b89f",
          400: "#8aa48e",
          500: "#6d8f7d",
          600: "#5b7d74",
          700: "#4a6660",
          800: "#3a504b",
          900: "#2a3b37",
          950: "#1a2624",
        },
        peach: {
          50: "#fdf8f5",
          100: "#f9efe8",
          200: "#f2ddd0",
          300: "#e7d8ca",
          400: "#d9c4b0",
          500: "#c9ad97",
          600: "#b5937a",
          700: "#9a7660",
          800: "#7d5e4c",
          900: "#5e453a",
        },
        mint: {
          100: "#dce5e1",
          200: "#c8d8d3",
          300: "#b0c8c0",
        },
      },
    },
  },
  plugins: [],
};
