/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        cream: {
          50: "#fdfaf6",
          100: "#faf3ea",
          200: "#f3e6d3",
          300: "#e9d3b3",
        },
        terracotta: {
          50: "#fbf0ec",
          100: "#f4dbd0",
          200: "#e7b7a2",
          300: "#da9377",
          400: "#cd8465",
          500: "#c17a5c",
          600: "#a8624a",
          700: "#864e3c",
          800: "#633a2c",
          900: "#41271d",
        },
        sage: {
          50: "#f2f5ee",
          100: "#e2e9d8",
          200: "#c5d3b1",
          300: "#a8bd8a",
          400: "#8fa96f",
          500: "#758f56",
          600: "#5d7244",
          700: "#465634",
          800: "#2f3a23",
          900: "#1c2315",
        },
        ink: {
          500: "#5c4a3f",
          700: "#3a2e26",
          900: "#241b16",
        },
      },
      fontFamily: {
        sans: [
          "'Nunito'",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
      },
      boxShadow: {
        soft: "0 4px 20px -4px rgba(101, 67, 33, 0.18)",
        press: "inset 0 3px 8px rgba(0,0,0,0.15)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
    },
  },
  plugins: [],
};
