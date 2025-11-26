/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // Habilita dark mode con clase
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        primary: {
          DEFAULT: 'var(--primary)',
          light: 'var(--primary-light)',
          dark: 'var(--primary-dark)',
        },
        accent: 'var(--accent)',
        card: 'var(--card-bg)',
        sidebar: 'var(--sidebar-bg)',
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(78, 42, 142, 0.1)',
        'glow': '0 0 15px rgba(166, 108, 195, 0.3)',
      },
    },
  },
  plugins: [],
}
