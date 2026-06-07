import { ActivityType } from "../types/type";

export const PREFIX = "@runna/test";

export const STORAGE_KEYS = {
    onboarding: `${PREFIX}:onboarding`,
    activity: `${PREFIX}:activity`,
    record: `${PREFIX}:record`,
    profile: `${PREFIX}:profile`,
    settings: `${PREFIX}:settings`,
    welcome: `${PREFIX}:welcome`,
};

export const ACTIVITY_BACKGROUND_TASK = "ACTIVITY_BACKGROUND_TASK";

export const ICON_TAILWIND_COLORS: Record<string, string> = {
    // 🏃‍♂️ Distance
    location: "text-emerald-500",
    navigate: "text-emerald-500",
    navigation: "text-emerald-500",

    // ⏱️ Duration
    time: "text-amber-500",

    // ⏱️ Pace
    timer: "text-indigo-500",

    // 🔥 Calories
    flame: "text-rose-500",

    // 👟 Steps
    "stats-chart": "text-sky-500",
    footsteps: "text-sky-500",

    // ⚡ Speed
    speedometer: "text-violet-500",
    speed: "text-violet-500",
};

export const ACTIVITY_TYPE = ["walk", "run"] as const;
export const ACTIVITY_TYPE_COLOR: Record<ActivityType, string> = {
    walk: "#3b82f6",
    run: "#f97316",
};
