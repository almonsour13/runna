import { create } from "zustand";
import { MapStyleName } from "../constant/map";
import { Settings, ThemeMode, UnitMode } from "../types/type";

type SettingsStore = {
    settings: Settings;
    setSettings: (settings: Settings | null) => void;
    updatePreferences: (partial: Partial<Settings["preferences"]>) => void;
    // keep these for convenience / backwards compat
    setTheme: (theme: ThemeMode) => void;
    setUnit: (unit: UnitMode) => void;
    setGoal: (goal: number) => void;
    setMapStyle: (mapStyle: MapStyleName) => void;
};

const defaultSettings: Settings = {
    preferences: {
        theme: "system",
        unit: "kilometers",
        goal: 0,
        mapStyle: "Streets",
    },
};

export const useSettingsStore = create<SettingsStore>((set, get) => ({
    settings: defaultSettings,

    setSettings: (settings) => set({ settings: settings ?? defaultSettings }),

    updatePreferences: (partial) =>
        set((state) => ({
            settings: {
                ...state.settings,
                preferences: {
                    ...state.settings.preferences,
                    ...partial,
                },
            },
        })),

    // convenience wrappers — all delegate to updatePreferences
    setTheme: (theme) => get().updatePreferences({ theme }),
    setUnit: (unit) => get().updatePreferences({ unit }),
    setGoal: (goal) => get().updatePreferences({ goal }),
    setMapStyle: (mapStyle) => get().updatePreferences({ mapStyle }),
}));
