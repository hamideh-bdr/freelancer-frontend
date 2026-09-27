/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Vazirmatn", "Tahoma", "sans-serif"],
      },
      colors: {
        brand: {
          50: "#eef4f2",
          100: "#d6e6e1",
          200: "#adccc3",
          300: "#7fb0a2",
          400: "#4f9482",
          500: "#2f7a67",
          600: "#1f4b43",
          700: "#193d37",
          800: "#142f2b",
          900: "#0f2320",
        },
        accent: {
          50: "#fbf3e9",
          100: "#f5e2c6",
          200: "#eccb98",
          300: "#e1af69",
          400: "#d68c45",
          500: "#c17530",
          600: "#9d5e26",
          700: "#7a481f",
        },
        paper: "#f7f5f1",
        ink: "#1c1917",
        muted: "#6b6459",
        line: "#e7e2d9",
      },
      boxShadow: {
        soft: "0 1px 2px 0 rgba(28, 25, 23, 0.06)",
      },
    },
  },
  plugins: [],
};
