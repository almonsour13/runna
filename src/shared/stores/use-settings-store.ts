import { create } from "zustand";
import { Settings, ThemeMode } from "../types/type";

export type UnitMode = "metric" | "imperial";

type SettingsStore = {
    settings: Settings;

    setSettings: (settings: Settings | null) => void;

    updateSettings: (partial: Partial<Settings>) => void;

    setTheme: (theme: ThemeMode) => void;

    setUnit: (unit: UnitMode) => void;
};

const defaultSettings: Settings = {
    preferences: {
        theme: "system",
        unit: "metric",
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
}));
