/** @type {import('tailwindcss').Config} */
export default {
	content: [
	  "./index.html",
	  "./src/**/*.{js,ts,jsx,tsx}",
	],
	safelist: [
	  // Safelist gradient classes for custom colors
	  {
		pattern: /^(bg-gradient-to|from|via|to)-(grade1|grade2|grade3|success|error|celebration)-(50|100|200|300|400|500|600|700)$/,
	  },
	],
	theme: {
	  extend: {
		fontFamily: {
		  sans: ['Poppins', 'system-ui', 'sans-serif'],
		},
		colors: {
		  // Grade 1 - Nature/Green theme
		  grade1: {
			50: '#f0fdf4',
			100: '#dcfce7',
			200: '#bbf7d0',
			300: '#86efac',
			400: '#4ade80',
			500: '#22c55e',
			600: '#16a34a',
			700: '#15803d',
		  },
		  // Grade 2 - Sky/Blue theme
		  grade2: {
			50: '#eff6ff',
			100: '#dbeafe',
			200: '#bfdbfe',
			300: '#93c5fd',
			400: '#60a5fa',
			500: '#3b82f6',
			600: '#2563eb',
			700: '#1d4ed8',
		  },
		  // Grade 3 - Magic/Purple theme
		  grade3: {
			50: '#faf5ff',
			100: '#f3e8ff',
			200: '#e9d5ff',
			300: '#d8b4fe',
			400: '#c084fc',
			500: '#a855f7',
			600: '#9333ea',
			700: '#7e22ce',
		  },
		  // Feedback colors
		  success: {
			50: '#f0fdf4',
			100: '#dcfce7',
			400: '#4ade80',
			500: '#22c55e',
			600: '#16a34a',
			700: '#15803d',
		  },
		  error: {
			50: '#fee2e2',
			400: '#f87171',
			500: '#ef4444',
			600: '#dc2626',
		  },
		  celebration: {
			50: '#fefce8',
			100: '#fef9c3',
			400: '#facc15',
			500: '#eab308',
			600: '#ca8a04',
			700: '#a16207',
		  },
		},
		animation: {
		  'bounce-slow': 'bounce 2s infinite',
		  'wiggle': 'wiggle 0.5s ease-in-out',
		  'pop': 'pop 0.3s ease-out',
		},
		keyframes: {
		  wiggle: {
			'0%, 100%': { transform: 'rotate(-3deg)' },
			'50%': { transform: 'rotate(3deg)' },
		  },
		  pop: {
			'0%': { transform: 'scale(0.95)' },
			'50%': { transform: 'scale(1.05)' },
			'100%': { transform: 'scale(1)' },
		  },
		},
	  },
	},
	plugins: [],
  }