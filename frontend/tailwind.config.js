/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary Brand Colors - Pink & White Palette
        primary: '#FF1493',      // Deep Pink - Main brand color
        secondary: '#FF69B4',    // Hot Pink - Hover states, accents
        tertiary: '#FFB6C1',     // Light Pink - Soft accents
        pinkLight: '#FFF0F5',    // Lavender Blush - Alternating backgrounds
        
        // Background & Surface
        background: '#FFFFFF',    // Pure white background
        surface: '#FFFFFF',       // Card backgrounds
        card: '#FFFFFF',          // White cards
        
        // Text Colors
        textDark: '#1A1A1A',      // Headings, important text
        textLight: '#8E8E93',     // Descriptions, secondary info
        
        // Border Colors
        border: '#FFE5EC',        // Light pink borders
        
        // Status Colors
        success: '#34C759',       // Fresh green
        error: '#FF3B30',         // Bright red
        warning: '#FFCC00',       // Gold yellow
        info: '#FF1493',          // Deep pink for info
        
        // Legacy Support (mapped to new colors)
        darkPlum: '#FF1493',      // Replaced with primary
        magenta: '#FF69B4',       // Replaced with secondary
        blush: '#FFB6C1',         // Replaced with tertiary
        deepBlack: '#1A1A1A',     // Replaced with textDark
      },
      fontFamily: {
        playfair: ['Playfair Display', 'serif'],
        montserrat: ['Montserrat', 'sans-serif'],
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(135deg, #FF1493 0%, #FF69B4 50%, #FFB6C1 100%)',
        'button-gradient': 'linear-gradient(90deg, #FF1493 0%, #FF69B4 100%)',
        'pink-white': 'linear-gradient(135deg, #FFF0F5 0%, #FFFFFF 100%)',
      },
      boxShadow: {
        'pink-sm': '0 1px 2px 0 rgba(255, 20, 147, 0.05)',
        'pink': '0 4px 14px 0 rgba(255, 20, 147, 0.15)',
        'pink-lg': '0 10px 40px 0 rgba(255, 20, 147, 0.2)',
        'pink-xl': '0 20px 60px 0 rgba(255, 20, 147, 0.25)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-up': 'scaleUp 0.2s ease-out',
        'pulse-pink': 'pulsePink 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleUp: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        pulsePink: {
          '0%, 100%': { 
            boxShadow: '0 0 0 0 rgba(255, 20, 147, 0.4)',
          },
          '50%': { 
            boxShadow: '0 0 0 10px rgba(255, 20, 147, 0)',
          },
        },
      },
    },
  },
  plugins: [],
}