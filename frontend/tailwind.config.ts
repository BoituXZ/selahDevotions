import type { Config } from 'tailwindcss'

export default {
  darkMode: 'selector', // Enable class-based dark mode (uses .dark selector)
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
} satisfies Config
