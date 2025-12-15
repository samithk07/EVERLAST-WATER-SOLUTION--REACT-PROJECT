module.exports = {
  darkMode: 'class',
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      // Water Purifier Brand Colors
      colors: {
        'wp-primary': {
          500: '#00A9FF',
          400: '#89CFF3',
          300: '#A0E9FF',
          100: '#CDF5FD',
        }
      },
      
      // Custom Animations
      keyframes: {
        'slide-in': {
          '0%': {
            transform: 'translateX(100%)',
            opacity: '0',
          },
          '100%': {
            transform: 'translateX(0)',
            opacity: '1',
          },
        },
        'slide-in-up': {
          '0%': {
            transform: 'translateY(20px)',
            opacity: '0',
          },
          '100%': {
            transform: 'translateY(0)',
            opacity: '1',
          },
        },
        'slide-in-down': {
          '0%': {
            transform: 'translateY(-20px)',
            opacity: '0',
          },
          '100%': {
            transform: 'translateY(0)',
            opacity: '1',
          },
        },
        'slide-in-left': {
          '0%': {
            transform: 'translateX(-20px)',
            opacity: '0',
          },
          '100%': {
            transform: 'translateX(0)',
            opacity: '1',
          },
        },
        'fade-in': {
          '0%': {
            opacity: '0',
          },
          '100%': {
            opacity: '1',
          },
        },
        'pulse-once': {
          '0%, 100%': {
            transform: 'scale(1)',
            opacity: '1',
          },
          '50%': {
            transform: 'scale(1.05)',
            opacity: '0.8',
          },
        },
        'shimmer': {
          '0%': {
            backgroundPosition: '-1000px 0',
          },
          '100%': {
            backgroundPosition: '1000px 0',
          },
        },
        'spin': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        'bounce': {
          '0%, 100%': {
            transform: 'translateY(0)',
            animationTimingFunction: 'cubic-bezier(0.8, 0, 1, 1)',
          },
          '50%': {
            transform: 'translateY(-25%)',
            animationTimingFunction: 'cubic-bezier(0, 0, 0.2, 1)',
          },
        },
        'ping': {
          '75%, 100%': {
            transform: 'scale(2)',
            opacity: '0',
          },
        },
        'pulse': {
          '0%, 100%': {
            opacity: '1',
          },
          '50%': {
            opacity: '.5',
          },
        },
        'progress': {
          '0%': {
            width: '0%',
          },
          '100%': {
            width: '100%',
          },
        },
        'float': {
          '0%, 100%': {
            transform: 'translateY(0)',
          },
          '50%': {
            transform: 'translateY(-10px)',
          },
        },
        'gradient-shift': {
          '0%, 100%': {
            backgroundPosition: '0% 50%',
          },
          '50%': {
            backgroundPosition: '100% 50%',
          },
        },
      },
      
      animation: {
        'slide-in': 'slide-in 0.3s ease-out',
        'slide-in-up': 'slide-in-up 0.6s ease-out',
        'slide-in-down': 'slide-in-down 0.4s ease-out',
        'slide-in-left': 'slide-in-left 0.4s ease-out',
        'fade-in': 'fade-in 0.5s ease-out',
        'fade-in-up': 'slide-in-up 0.6s ease-out',
        'fade-in-down': 'slide-in-down 0.4s ease-out',
        'fade-in-left': 'slide-in-left 0.4s ease-out',
        'pulse-once': 'pulse-once 0.5s ease-in-out',
        'shimmer': 'shimmer 2s infinite linear',
        'spin': 'spin 1s linear infinite',
        'bounce': 'bounce 1s infinite',
        'pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'ping': 'ping 1s cubic-bezier(0, 0, 0.2, 1) infinite',
        'progress': 'progress 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'gradient-shift': 'gradient-shift 3s ease infinite',
      },
      
      // Background Images
      backgroundImage: {
        'gradient-water': 'linear-gradient(to bottom, #00A9FF, #89CFF3, #A0E9FF, #CDF5FD)',
        'gradient-water-horizontal': 'linear-gradient(to right, #00A9FF, #89CFF3, #A0E9FF, #CDF5FD)',
        'gradient-card': 'linear-gradient(to bottom right, rgba(255,255,255,0.9), rgba(205, 245, 253, 0.3))',
        'gradient-glass': 'linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0))',
      },
      
      // Box Shadow
      boxShadow: {
        'wp-sm': '0 1px 3px 0 rgba(0, 169, 255, 0.1), 0 1px 2px 0 rgba(0, 169, 255, 0.06)',
        'wp': '0 4px 6px -1px rgba(0, 169, 255, 0.1), 0 2px 4px -1px rgba(0, 169, 255, 0.06)',
        'wp-md': '0 6px 12px -2px rgba(0, 169, 255, 0.1), 0 3px 7px -3px rgba(0, 169, 255, 0.08)',
        'wp-lg': '0 10px 25px -3px rgba(0, 169, 255, 0.1), 0 4px 10px -4px rgba(0, 169, 255, 0.06)',
        'wp-xl': '0 20px 40px -5px rgba(0, 169, 255, 0.1), 0 10px 20px -8px rgba(0, 169, 255, 0.04)',
        'wp-2xl': '0 25px 50px -12px rgba(0, 169, 255, 0.25)',
        'wp-inner': 'inset 0 2px 4px 0 rgba(0, 169, 255, 0.06)',
        'wp-glow': '0 0 20px rgba(0, 169, 255, 0.3)',
      },
      
      // Border Radius
      borderRadius: {
        'wp-xl': '1rem',
        'wp-2xl': '1.5rem',
        'wp-3xl': '2rem',
      },
      
      // Transition
      transitionDuration: {
        'wp-slow': '500ms',
        'wp-normal': '300ms',
        'wp-fast': '150ms',
      },
      
      // Backdrop Blur
      backdropBlur: {
        'wp-xs': '2px',
        'wp-sm': '4px',
        'wp-md': '8px',
        'wp-lg': '12px',
        'wp-xl': '16px',
      },
      
      // Container
      container: {
        center: true,
        padding: {
          DEFAULT: '1rem',
          sm: '2rem',
          lg: '4rem',
          xl: '5rem',
          '2xl': '6rem',
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/line-clamp'),
  ],
}