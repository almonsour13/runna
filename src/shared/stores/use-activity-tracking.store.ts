import { create } from "zustand";
import { Coordinate } from "../db/repositories/coordinate.repository";
import { ActivityTrackingStatus } from "../types/type";
type TrackedCoordinate = Omit<Coordinate, "id" | "activityId">;
type ActivityTrackingStore = {
    status: ActivityTrackingStatus;
    duration: number;
    previewCoordinate: TrackedCoordinate | null;
    coordinates: TrackedCoordinate[];
    label: string | null;
    mode: "preview" | "recording";

    setDuration: (duration: number) => void;
    setStatus: (status: ActivityTrackingStatus) => void;
    setPreviewCoordinate: (coordinate: TrackedCoordinate | null) => void;
    setCoordinates: (coordinates: TrackedCoordinate[]) => void;
    addCoordinate: (coordinate: Coordinate) => void;
    setLabel: (label: string | null) => void;
    setMode: (mode: "preview" | "recording") => void;
    clearActivity: () => void;
};

const INITIAL_STATE = {
    status: "idle" as ActivityTrackingStatus,
    duration: 0,
    previewCoordinate: null,
    coordinates: [] as Coordinate[],
    label: null,
    mode: "preview" as const,
};

export const useActivityTrackingStore = create<ActivityTrackingStore>(
    (set) => ({
        ...INITIAL_STATE,

        setDuration: (duration) => set({ duration }),
        setStatus: (status) => set({ status }),
        setPreviewCoordinate: (previewCoordinate) => set({ previewCoordinate }),
        setCoordinates: (coordinates) => set({ coordinates }),
        addCoordinate: (coordinate) =>
            set((state) => ({
                coordinates: [...state.coordinates, coordinate],
            })),
        setLabel: (label) => set({ label }),
        setMode: (mode) => set({ mode }),
        clearActivity: () => set(INITIAL_STATE),
    }),
);
