/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            animation: {
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            },
            colors: {
                primary: '#3b82f6',
                'base-content': {
                    DEFAULT: '#e5e7eb',
                    60: '#9ca3af',
                    70: '#6b7280',
                    40: '#9ca3af',
                },
            }
        },
    },
    plugins: [],
}
