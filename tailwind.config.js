/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Montserrat', 'Pretendard', 'sans-serif'],
                serif: ['Cormorant Garamond', 'serif'],
            },
            colors: {
                pink: {
                    50: '#FFF5F7',
                    100: '#FFEBEF',
                    200: '#FFD1DA',
                    300: '#FFB1CC',
                    400: '#FF7EAD',
                    500: '#FF4D8E',
                }
            }
        },
    },
    plugins: [],
}
