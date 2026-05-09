import { create } from "zustand";

export type ThemeMode = "light" | "dark" | "system";
export type UnitMode = "metric" | "imperial";

type Preferences = {
    theme: ThemeMode;
    unit: UnitMode;
};

type SettingsStore = {
    isLoading: boolean;
    setIsLoading: (isLoading: boolean) => void;

    preferences: Preferences;
    setTheme: (theme: ThemeMode) => void;
    setUnit: (unit: UnitMode) => void;
};

const INITIAL_VALUE: Pick<SettingsStore, "isLoading" | "preferences"> = {
    isLoading: false,
    preferences: {
        theme: "system",
        unit: "metric",
    },
};

export const useSettingsStore = create<SettingsStore>((set) => ({
    ...INITIAL_VALUE,

    setIsLoading: (isLoading) => set({ isLoading }),

    setTheme: (theme) =>
        set((state) => ({
            preferences: { ...state.preferences, theme },
        })),

    setUnit: (unit) =>
        set((state) => ({
            preferences: { ...state.preferences, unit },
        })),
}));
