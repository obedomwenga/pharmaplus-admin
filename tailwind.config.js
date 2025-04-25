/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
    "./src/app/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary brand colors based on PharmaPlus website
        pharma: {
          green: {
            light: '#22c55e',
            DEFAULT: '#16a34a', // Primary brand green
            dark: '#15803d'
          },
          blue: '#0ea5e9',
          gray: {
            light: '#f9fafb',
            DEFAULT: '#f3f4f6',
            dark: '#e5e7eb',
            darker: '#d1d5db'
          }
        },
        // Background colors
        background: {
          light: '#ffffff',
          DEFAULT: '#f9fafb',
          gray: '#f3f4f6'
        },
        // Text colors
        text: {
          primary: '#111827',
          secondary: '#4b5563',
          muted: '#6b7280',
          light: '#9ca3af',
          white: '#ffffff'
        },
        // UI state colors
        state: {
          success: '#16a34a',
          error: '#dc2626',
          warning: '#f59e0b',
          info: '#0ea5e9',
        }
      },
      fontFamily: {
        sans: [
          'Inter',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
      },
      boxShadow: {
        'card': '0 2px 4px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.1)',
        'elevated': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      },
      borderRadius: {
        'DEFAULT': '0.375rem',
      }
    },
  },
  plugins: [],
} 