import { LocationAccuracy } from "expo-location";

export const LOCATION_TIME_INTERVAL_MS = 3000;
export const LOCATION_ACCURACY = LocationAccuracy.BestForNavigation;
export const DISTANCE_INTERVAL_METERS = 5;

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
