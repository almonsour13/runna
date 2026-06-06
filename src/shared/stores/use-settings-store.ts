import { create } from "zustand";
import { Settings, ThemeMode, UnitMode } from "../types/type";

type SettingsStore = {
    settings: Settings;

    setSettings: (settings: Settings | null) => void;

    updateSettings: (partial: Partial<Settings>) => void;

    setTheme: (theme: ThemeMode) => void;

    setUnit: (unit: UnitMode) => void;
    setGoal: (goal: number) => void;
};

const defaultSettings: Settings = {
    preferences: {
        theme: "system",
        unit: "kilometers",
        goal: 0,
    },
};

export const useSettingsStore = create<SettingsStore>((set, get) => ({
    settings: defaultSettings,

    setSettings: (settings) => {
        set({
            settings: settings ?? defaultSettings,
        });
    },

    updateSettings: (partial) => {
        const current = get().settings;

        const updated: Settings = {
            ...current,
            ...partial,

            preferences: {
                ...current.preferences,
                ...partial.preferences,
            },
        };

        set({
            settings: updated,
        });
    },

    setTheme: (theme) =>
        set((state) => ({
            settings: {
                ...state.settings,
                preferences: {
                    ...state.settings.preferences,
                    theme,
                },
            },
        })),

    setUnit: (unit) =>
        set((state) => ({
            settings: {
                ...state.settings,
                preferences: {
                    ...state.settings.preferences,
                    unit,
                },
            },
        })),
    setGoal: (goal) =>
        set((state) => ({
            settings: {
                ...state.settings,
                preferences: {
                    ...state.settings.preferences,
                    goal,
                },
            },
        })),
}));
