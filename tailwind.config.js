/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./**/*.{html,js}"],
  theme: {
    extend: {
      fontFamily: {
        'grotesk': ['Space Grotesk', 'sans-serif'],
        'inter': ['Inter', 'sans-serif'],
        'mono': ['Space Mono', 'monospace']
      }
    },
  },
  plugins: [],
}

