/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2d5016',
        secondary: '#7cb342', 
        accent: '#ff8f00',
        surface: '#ffffff',
        background: '#f5f5f0',
        success: '#4caf50',
        warning: '#ffa726',
        error: '#e53935',
        info: '#29b6f6'
      },
      fontFamily: {
        'display': ['Inter', 'sans-serif'],
        'body': ['Inter', 'sans-serif']
      }
    },
  },
  plugins: [],
}