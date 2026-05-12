import { create } from "zustand";
import { ActivityTrackingStatus, Coordinate } from "../types/type";

type ActivityTrackingStore = {
    status: ActivityTrackingStatus;
    duration: number;
    previewCoordinate: Coordinate | null;
    coordinates: Coordinate[];
    label: string | null;
    mode: "preview" | "recording";
    isMapExpanded: boolean;

    setDuration: (duration: number) => void;
    setStatus: (status: ActivityTrackingStatus) => void;
    setPreviewCoordinate: (coordinate: Coordinate | null) => void;
    setCoordinates: (coordinates: Coordinate[]) => void;
    addCoordinate: (coordinate: Coordinate) => void;
    setLabel: (label: string | null) => void;
    setMode: (mode: "preview" | "recording") => void;
    setIsMapExpanded: (isMapExpanded: boolean) => void;
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
        isMapExpanded: false,

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
        setIsMapExpanded: (isMapExpanded) => set({ isMapExpanded }),
        clearActivity: () => set(INITIAL_STATE),
    }),
);
