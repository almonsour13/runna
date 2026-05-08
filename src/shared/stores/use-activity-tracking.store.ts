import { create } from "zustand";
import { ActivityTrackingStatus, Coordinate } from "../types/type";

type ActivityTracking = {
    status: ActivityTrackingStatus;
    duration: number;
    coordinates: Coordinate[] | [];
};

type ActivityTrackingState = {
    activity: ActivityTracking;

    setActivity: (activity: ActivityTracking) => void;
    clearActivity: () => void;

    setDuration: (duration: number) => void;
    setStatus: (status: ActivityTrackingStatus) => void;

    setCoordinates: (coordinates: Coordinate[]) => void;
    addCoordinate: (coordinate: Coordinate) => void;

    isMapExpanded?: boolean;
    setIsMapExpanded: (isMapExpanded: boolean) => void;
};

const INITIAL_STATE: ActivityTracking = {
    status: "idle",
    duration: 0,
    coordinates: [],
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

        setCoordinates: (coordinates) =>
            set((state) => ({
                activity: {
                    ...state.activity,
                    coordinates,
                },
            })),
        addCoordinate: (coordinate) =>
            set((state) => ({
                activity: {
                    ...state.activity,
                    coordinates: [...state.activity.coordinates, coordinate],
                },
            })),

        isMapExpanded: false,
        setIsMapExpanded: (isMapExpanded) => set({ isMapExpanded }),
    }),
);
