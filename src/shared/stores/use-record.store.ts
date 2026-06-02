import { create } from "zustand";
import { ActivityType, RawCoordinate, RecordStatus } from "../types/type";

type TrackedCoordinate = Omit<RawCoordinate, "id" | "activityId">;

type RecordStore = {
    activityType: ActivityType | null;
    status: RecordStatus;
    duration: number;
    steps: number;
    previewCoordinate: RawCoordinate | null;
    coordinates: RawCoordinate[];
    mode: "preview" | "recording" | null;

    setActivityType: (activityType: ActivityType | null) => void;
    setDuration: (duration: number) => void;
    setSteps: (steps: number) => void;
    setStatus: (status: RecordStatus) => void;
    setPreviewCoordinate: (coordinate: RawCoordinate | null) => void;
    setCoordinates: (coordinates: RawCoordinate[]) => void;
    addCoordinate: (coordinate: RawCoordinate) => void;
    setMode: (mode: "preview" | "recording") => void;
    clearActivity: () => void;
};

const INITIAL_STATE = {
    activityType: null,
    status: "idle" as RecordStatus,
    duration: 0,
    steps: 0,
    previewCoordinate: null,
    coordinates: [] as RawCoordinate[],
    mode: null,
};

export const useRecordStore = create<RecordStore>((set) => ({
    ...INITIAL_STATE,

    setActivityType: (activityType) => set({ activityType }),
    setDuration: (duration) => set({ duration }),
    setSteps: (steps) => set({ steps }),
    setStatus: (status) => set({ status }),
    setPreviewCoordinate: (previewCoordinate) => set({ previewCoordinate }),
    setCoordinates: (coordinates) => set({ coordinates }),
    addCoordinate: (coordinate) =>
        set((state) => ({
            coordinates: [...state.coordinates, coordinate],
        })),
    setMode: (mode) => set({ mode }),
    clearActivity: () =>
        set((state) => ({
            ...INITIAL_STATE,
            previewCoordinate: state.previewCoordinate,
        })),
}));
