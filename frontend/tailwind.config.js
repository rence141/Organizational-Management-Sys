// Tailwind scans these files to generate the exact CSS utilities you use.
// If you add new folders, include them in 'content' so Tailwind picks them up.
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: 'class', // Enable class-based dark mode
  theme: { extend: {} }, // put custom colors, fonts, etc. inside extend
  plugins: [],           // add tailwind official plugins if needed
}