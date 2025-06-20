/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/**/*.{js,jsx,ts,tsx}",
        "./public/index.html"
    ],
    darkMode: 'class', // Dark mode-ի համար
    theme: {
        extend: {
            // Գույներ
            colors: {
                primary: {
                    50: '#0f4c75',   // было 900
                    100: '#105582',  // было 800  
                    200: '#146ba0',  // было 700
                    300: '#1783c1',  // было 600
                    400: '#1c92d2',  // было 500
                    500: '#f2fcfe',  // было 50 - теперь основной цвет светлый
                    600: '#6bc8e0',  // было 400
                    700: '#a7e1f1',  // было 300
                    800: '#cef0f8',  // было 200
                    900: '#e6f7fc',  // было 100
                },
                
                // Также в secondary цветах (если нужно):
                secondary: {
                    50: '#164f6b',   // было 900
                    100: '#1a6589',  // было 800
                    200: '#1f7da8',  // было 700  
                    300: '#2591c1',  // было 600
                    400: '#2ba3d4',  // было 500
                    500: '#f2fcfe',  // было 50
                    600: '#4fb8e3',  // было 400
                    700: '#89d6f0',  // было 300
                    800: '#b3e8f7',  // было 200
                    900: '#ddf5fc',  // было 100
                },
                
                accent: {
                    50: '#f0fdfa',
                    100: '#ccfbf1',
                    200: '#99f6e4',
                    300: '#5eead4',
                    400: '#2dd4bf',
                    500: '#14b8a6',
                    600: '#0d9488',
                    700: '#0f766e',
                    800: '#115e59',
                    900: '#134e4a',
                },
                success: {
                    50: '#f2fcfe',
                    100: '#e6f7fc',
                    200: '#cef0f8',
                    300: '#a7e1f1',
                    400: '#6bc8e0',
                    500: '#1c92d2',
                    600: '#1783c1',
                    700: '#146ba0',
                    800: '#105582',
                    900: '#0f4c75',
                },
                warning: {
                    50: '#fffbeb',
                    100: '#fef3c7',
                    200: '#fde68a',
                    300: '#fcd34d',
                    400: '#fbbf24',
                    500: '#f59e0b',
                    600: '#d97706',
                    700: '#b45309',
                    800: '#92400e',
                    900: '#78350f',
                },
                danger: {
                    50: '#fef2f2',
                    100: '#fee2e2',
                    200: '#fecaca',
                    300: '#fca5a5',
                    400: '#f87171',
                    500: '#ef4444',
                    600: '#dc2626',
                    700: '#b91c1c',
                    800: '#991b1b',
                    900: '#7f1d1d',
                },
                neutral: {
                    50: '#183942',   // было 900
                    100: '#1f4a5b',  // было 800
                    200: '#285e77',  // было 700
                    300: '#337a96',  // было 600
                    400: '#439bb8',  // было 500
                    500: '#f2fcfe',  // было 50
                    600: '#6bc8e0',  // было 400
                    700: '#a7e1f1',  // было 300
                    800: '#cef0f8',  // было 200
                    900: '#e6f7fc',  // было 100
                }
            },

            // Ֆոնտային ընտանիքներ
            fontFamily: {
                sans: [
                    'Inter',
                    'ui-sans-serif',
                    'system-ui',
                    '-apple-system',
                    'BlinkMacSystemFont',
                    '"Segoe UI"',
                    'Roboto',
                    '"Helvetica Neue"',
                    'Arial',
                    '"Noto Sans"',
                    'sans-serif',
                ],
                serif: [
                    'ui-serif',
                    'Georgia',
                    'Cambria',
                    '"Times New Roman"',
                    'Times',
                    'serif',
                ],
                mono: [
                    'ui-monospace',
                    'SFMono-Regular',
                    '"SF Mono"',
                    'Consolas',
                    '"Liberation Mono"',
                    'Menlo',
                    'monospace',
                ],
            },

            // Անիմացիաներ
            animation: {
                'fade-in': 'fadeIn 0.5s ease-in-out',
                'slide-in-right': 'slideInRight 0.3s ease-out',
                'slide-in-left': 'slideInLeft 0.3s ease-out',
                'slide-in-up': 'slideInUp 0.3s ease-out',
                'slide-in-down': 'slideInDown 0.3s ease-out',
                'scale-in': 'scaleIn 0.2s ease-out',
                'bounce-soft': 'bounceSoft 1s ease-in-out infinite',
                'pulse-slow': 'pulseSlow 3s ease-in-out infinite',
                'spin-slow': 'spinSlow 3s linear infinite',
                'float': 'float 3s ease-in-out infinite',
                'glow': 'glow 2s ease-in-out infinite alternate',
            },

            // Keyframes
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0', transform: 'translateY(10px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                slideInRight: {
                    '0%': { opacity: '0', transform: 'translateX(20px)' },
                    '100%': { opacity: '1', transform: 'translateX(0)' },
                },
                slideInLeft: {
                    '0%': { opacity: '0', transform: 'translateX(-20px)' },
                    '100%': { opacity: '1', transform: 'translateX(0)' },
                },
                slideInUp: {
                    '0%': { opacity: '0', transform: 'translateY(20px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                slideInDown: {
                    '0%': { opacity: '0', transform: 'translateY(-20px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                scaleIn: {
                    '0%': { opacity: '0', transform: 'scale(0.9)' },
                    '100%': { opacity: '1', transform: 'scale(1)' },
                },
                bounceSoft: {
                    '0%, 20%, 53%, 80%, 100%': { transform: 'translate3d(0,0,0)' },
                    '40%, 43%': { transform: 'translate3d(0,-8px,0)' },
                    '70%': { transform: 'translate3d(0,-4px,0)' },
                    '90%': { transform: 'translate3d(0,-2px,0)' },
                },
                pulseSlow: {
                    '0%, 100%': { opacity: '1' },
                    '50%': { opacity: '0.5' },
                },
                spinSlow: {
                    '0%': { transform: 'rotate(0deg)' },
                    '100%': { transform: 'rotate(360deg)' },
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-10px)' },
                },
                glow: {
                    '0%': { boxShadow: '0 0 5px rgba(28, 146, 210, 0.5)' },
                    '100%': { boxShadow: '0 0 20px rgba(28, 146, 210, 0.8)' },
                },
            },

            // Spacing
            spacing: {
                '18': '4.5rem',
                '88': '22rem',
                '100': '25rem',
                '104': '26rem',
                '108': '27rem',
                '112': '28rem',
                '116': '29rem',
                '120': '30rem',
            },

            // Box shadow
            boxShadow: {
                'soft': '0 2px 15px -3px rgba(28, 146, 210, 0.07), 0 10px 20px -2px rgba(28, 146, 210, 0.04)',
                'medium': '0 4px 25px -5px rgba(28, 146, 210, 0.1), 0 10px 30px -5px rgba(28, 146, 210, 0.05)',
                'hard': '0 10px 40px -10px rgba(28, 146, 210, 0.15), 0 20px 50px -15px rgba(28, 146, 210, 0.1)',
                'glow': '0 0 20px rgba(28, 146, 210, 0.4)',
                'glow-lg': '0 0 40px rgba(28, 146, 210, 0.6)',
            },

            // Backdrop blur
            backdropBlur: {
                xs: '2px',
            },

            // Z-index
            zIndex: {
                '60': '60',
                '70': '70',
                '80': '80',
                '90': '90',
                '100': '100',
            },

            // Border radius
            borderRadius: {
                '4xl': '2rem',
                '5xl': '2.5rem',
                '6xl': '3rem',
            },

            // Typography
            fontSize: {
                'xs': ['0.75rem', { lineHeight: '1rem' }],
                'sm': ['0.875rem', { lineHeight: '1.25rem' }],
                'base': ['1rem', { lineHeight: '1.5rem' }],
                'lg': ['1.125rem', { lineHeight: '1.75rem' }],
                'xl': ['1.25rem', { lineHeight: '1.75rem' }],
                '2xl': ['1.5rem', { lineHeight: '2rem' }],
                '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
                '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
                '5xl': ['3rem', { lineHeight: '1' }],
                '6xl': ['3.75rem', { lineHeight: '1' }],
                '7xl': ['4.5rem', { lineHeight: '1' }],
                '8xl': ['6rem', { lineHeight: '1' }],
                '9xl': ['8rem', { lineHeight: '1' }],
            },

            // Max width
            maxWidth: {
                '8xl': '88rem',
                '9xl': '96rem',
            },

            // Transition duration
            transitionDuration: {
                '400': '400ms',
                '600': '600ms',
                '800': '800ms',
                '900': '900ms',
            },

            // Screen sizes
            screens: {
                'xs': '475px',
                '3xl': '1600px',
            },
        },
    },
    plugins: [
        // Form controls styling
        require('@tailwindcss/forms')({
            strategy: 'class',
        }),

        // Typography plugin
        require('@tailwindcss/typography'),

        // Aspect ratio plugin
        require('@tailwindcss/aspect-ratio'),

        // Custom plugins
        function ({ addUtilities, addComponents, theme }) {
            // Custom utilities
            addUtilities({
                '.text-shadow': {
                    textShadow: '0 2px 4px rgba(28, 146, 210, 0.10)',
                },
                '.text-shadow-md': {
                    textShadow: '0 4px 8px rgba(28, 146, 210, 0.12), 0 2px 4px rgba(28, 146, 210, 0.08)',
                },
                '.text-shadow-lg': {
                    textShadow: '0 15px 30px rgba(28, 146, 210, 0.11), 0 5px 15px rgba(28, 146, 210, 0.08)',
                },
                '.text-shadow-none': {
                    textShadow: 'none',
                },
                '.transform-gpu': {
                    transform: 'translate3d(0, 0, 0)',
                },
                '.backface-hidden': {
                    backfaceVisibility: 'hidden',
                },
            });

            // Custom components
            addComponents({
                '.btn': {
                    padding: `${theme('spacing.2')} ${theme('spacing.4')}`,
                    borderRadius: theme('borderRadius.md'),
                    fontWeight: theme('fontWeight.medium'),
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    '&:focus': {
                        outline: 'none',
                        boxShadow: `0 0 0 2px ${theme('colors.primary.500')}`,
                    },
                    '&:disabled': {
                        opacity: '0.6',
                        cursor: 'not-allowed',
                    },
                },
                '.card': {
                    backgroundColor: theme('colors.primary.50'),
                    borderRadius: theme('borderRadius.lg'),
                    padding: theme('spacing.6'),
                    boxShadow: theme('boxShadow.soft'),
                    border: `1px solid ${theme('colors.primary.200')}`,
                },
                '.gradient-text': {
                    background: `linear-gradient(135deg, ${theme('colors.primary.500')}, ${theme('colors.secondary.500')})`,
                    backgroundClip: 'text',
                    '-webkit-background-clip': 'text',
                    '-webkit-text-fill-color': 'transparent',
                },
            });
        },
    ],
};