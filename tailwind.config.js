/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
    "./app/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#3ECF8E",
        background: "#0B1416",
        surface: "#1A1F23",
        muted: "#2A2E35",
        text: "#ffffff",
        "muted-text": "#94A3B8",
      },
    },
  },
  plugins: [],
};
