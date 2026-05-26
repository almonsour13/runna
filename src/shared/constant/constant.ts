import { LocationAccuracy } from "expo-location";

export const GPS_CONFIG = {
    LOCATION_GEOCODE_INTERVAL_MS: 15000,
    LOCATION_TIME_INTERVAL_MS: 1000,
    LOCATION_ACCURACY: LocationAccuracy.BestForNavigation,
    DISTANCE_INTERVAL_METERS: 2,
};

export const GPS_BACKGROUND_TRACKING_CONFIG = {
    DEFERRED_UPDATES_INTERVAL: 3000,
    DEFERRED_UPDATES_DISTANCE: 5,
};

export const GPS_FILTER_CONFIG = {
    MAX_ACCURACY_METERS: 25,
    MAX_SPEED_MS: 12,
    MIN_DISTANCE_METERS: 2,
    MAX_DISTANCE_METERS: 50,
};
export const MIN_ACCURACY_METERS = 15;
export const MIN_DISTANCE_METERS = 5;
export const MAX_SPEED_MPS = 10;
export const WARMUP_READINGS = 5;

export const PREFIX = "@runna/test";

export const STORAGE_KEYS = {
    onboarding: `${PREFIX}:onboarding`,
    activity: `${PREFIX}:activity`,
    activityTracking: `${PREFIX}:activityTracking`,
    profile: `${PREFIX}:profile`,
    settings: `${PREFIX}:settings`,
};

export const ACTIVITY_BACKGROUND_TASK = "ACTIVITY_BACKGROUND_TASK";

export const MAP_STYLES = [
    {
        name: "Streets",
        style: {
            light: "https://api.maptiler.com/maps/streets-v4/style.json?key=oanYTqJDReVoeo0ZLIK4",
            dark: "https://api.maptiler.com/maps/streets-v4-dark/style.json?key=oanYTqJDReVoeo0ZLIK4",
        },
    },
    {
        name: "Open Streets Map",
        style: {
            light: "https://api.maptiler.com/maps/openstreetmap/style.json?key=oanYTqJDReVoeo0ZLIK4",
            dark: "https://api.maptiler.com/maps/openstreetmap-dark/style.json?key=oanYTqJDReVoeo0ZLIK4",
        },
    },
];
export const ICON_COLORS: Record<string, string> = {
    location: "#3b82f6",
    navigate: "#3b82f6",
    navigation: "#3b82f6",
    time: "#64748b",
    timer: "#64748b",

    flame: "#f97316",
    "stats-chart": "#8b5cf6",
    speedometer: "#475569",
    speed: "#475569",
};

export const ACTIVITY_TYPE = ["walk", "run"] as const;
