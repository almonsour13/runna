/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/shared/components/**/*.{js,jsx,ts,tsx}",
        "./src/features/**/*.{js,jsx,ts,tsx}",
    ],
    presets: [require("nativewind/preset")],
    darkMode: "class", // Enables manual theme switching
    theme: {
        extend: {
            colors: {
                primary: "#02a963", // static, not a var()
            },
        },
    },
    plugins: [],
};
