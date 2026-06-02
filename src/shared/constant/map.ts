const MAPTILER_KEY = process.env.EXPO_PUBLIC_MAPTILER_KEY;

export const MAP_STYLES = [
    {
        name: "Streets",
        style: `https://api.maptiler.com/maps/streets-v4-dark/style.json?key=${MAPTILER_KEY}`,
    },
    {
        name: "Open Streets Map",
        style: `https://api.maptiler.com/maps/openstreetmap/style.json?key=${MAPTILER_KEY}`,
    },
    {
        name: "Satellite Hybrid",
        style: `https://api.maptiler.com/maps/hybrid-v4/style.json?key=${MAPTILER_KEY}`,
    },
];

// export const MAP_STYLES = [
//     {
//         name: "Streets",
//         style: {
//             light: `https://api.maptiler.com/maps/streets-v4/style.json?key=${MAPTILER_KEY}`,
//             dark: `https://api.maptiler.com/maps/streets-v4-dark/style.json?key=${MAPTILER_KEY}`,
//         },
//     },
//     {
//         name: "Open Streets Map",
//         style: {
//             light: `https://api.maptiler.com/maps/openstreetmap/style.json?key=${MAPTILER_KEY}`,
//             dark: `https://api.maptiler.com/maps/openstreetmap-dark/style.json?key=${MAPTILER_KEY}`,
//         },
//     },
//     {
//         name: "Satellite Hybrid",
//         style: {
//             light: `https://api.maptiler.com/maps/hybrid-v4/style.json?key=${MAPTILER_KEY}`,
//             dark: `https://api.maptiler.com/maps/hybrid-v4-dark/style.json?key=${MAPTILER_KEY}`,
//         },
//     },
// ];
