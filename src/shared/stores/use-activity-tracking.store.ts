import { create } from "zustand";
import { ActivityTrackingStatus } from "../types/type";

type ActivityTracking = {
    status: ActivityTrackingStatus;
    duration: number;
};

type ActivityTrackingState = {
    activity: ActivityTracking;

    setActivity: (activity: ActivityTracking) => void;
    clearActivity: () => void;

    setDuration: (duration: number) => void;
    setStatus: (status: ActivityTrackingStatus) => void;
};

const INITIAL_STATE: ActivityTracking = {
    status: "idle",
    duration: 0,
};

export const useActivityTrackingStore = create<ActivityTrackingState>(
    (set) => ({
        activity: INITIAL_STATE,

        setActivity: (activity) => set({ activity }),
        clearActivity: () => set({ activity: INITIAL_STATE }),

        setDuration: (duration) =>
            set((state) => ({
                activity: {
                    ...state.activity,
                    duration,
                },
            })),

        setStatus: (status) =>
            set((state) => ({
                activity: {
                    ...state.activity,
                    status,
                },
            })),
    }),
);
