/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        customLight: '#f6f6f9',
        customPrimary: '#1976D2',
        customLightPrimary: '#CFE8FF',
        customGrey: '#eee',
        customDarkGrey: '#AAAAAA',
        customDark: '#363949',
        customDanger: '#D32F2F',
        customLightDanger: '#FECDD3',
        customWarning: '#FBC02D',
        customLightWarning: '#FFF2C6',
        customSuccess: '#388E3C',
        customLightSuccess: '#BBF7D0',
      },
    },
  },
  plugins: [],
};
