/** @type {import('tailwindcss').Config} */
module.exports = {
	"content": [
		"./src/**/*.html",
		"./src/*.html",
	],
	important: true,
	theme: {
		extend: {
			keyframes: {
				slideDown: {
					'0%': { transform: 'translateY(-100%)', opacity: 0 },
					'100%': { transform: 'translateY(0)', opacity: 1 },
				},
				slideUp: {
					'0%': { transform: 'translateY(100%)', opacity: 0 },
					'100%': { transform: 'translateY(0%)', opacity: 1 },
				},
				showIn: {
					'0%': { opacity: 0 },
					'100%': { opacity: 1 },
				},
				hideIn: {
					'0%': { opacity: 1 },
					'100%': { opacity: 0 },
				}
			},
			animation: {
				slideDown: 'slideDown 1s ease-out forwards',
				slideUp: 'slideUp 1s ease-out forwards',
				showIn: 'showIn 1s ease-out forwards',
				hideIn: 'hideIn 1s ease-out forwards',
			},
		},
	},
	plugins: [
		require('tailwindcss/plugin')(({ matchUtilities, theme }) => {
			matchUtilities(
				{
					'animate-delay': (value) => ({
						animationDelay: value,
					}),
				},
				{ values: theme('transitionDelay') }
			);
		}),
	],
};
1