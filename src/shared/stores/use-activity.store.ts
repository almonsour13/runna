import { create } from "zustand";
import { Activity } from "../types/type";

type ActivityState = {
    isLoading: boolean;
    setIsLoading: (isLoading: boolean) => void;
    error: string | null;
    setError: (error: string | null) => void;
    activities: Activity[];
    setActivities: (activities: Activity[]) => void;
    addActivity: (activity: Activity) => void;
    updateActivity: (activity: Activity) => void;
    deleteActivity: (id: string) => void;
    clearActivities: () => void;
};

const INITIAL_VALUE = {
    isLoading: false,
    error: null,
    activities: [],
};

export const useActivityStore = create<ActivityState>((set, get) => ({
    ...INITIAL_VALUE,
    setIsLoading: (isLoading) => set({ isLoading }),
    setError: (error) => set({ error }),
    setActivities: (activities) => set({ activities }),
    addActivity: (activity) =>
        set({ activities: [...get().activities, activity] }),
    updateActivity: (activity) =>
        set({
            activities: get().activities.map((item) =>
                item.id === activity.id ? activity : item,
            ),
        }),
    deleteActivity: (id) =>
        set({
            activities: get().activities.filter(
                (activity) => activity.id !== id,
            ),
        }),

    clearActivities: () =>
        set({
            activities: [],
        }),
}));
