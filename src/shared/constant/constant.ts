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

const PREFIX = "@runna/test";

export const STORAGE_KEYS = {
    activity: `${PREFIX}:activity`,
    activityTracking: `${PREFIX}:activityTracking`,
    profile: `${PREFIX}:profile`,
    settings: `${PREFIX}:settings`,
};

export const ACTIVITY_BACKGROUND_TASK = "ACTIVITY_BACKGROUND_TASK";

export const OPEN_FREE_MAP_STYLES = [
    {
        name: "Liberty",
        style: "https://tiles.openfreemap.org/styles/liberty",
    },
    {
        name: "Positron (Clean Light)",
        style: "https://tiles.openfreemap.org/styles/positron",
    },
    {
        name: "Bright",
        style: "https://tiles.openfreemap.org/styles/bright",
    },
    {
        name: "Dark",
        style: "https://tiles.openfreemap.org/styles/dark",
    },
    {
        name: "Fiord",
        style: "https://tiles.openfreemap.org/styles/fiord",
    },
];
