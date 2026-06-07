import { create } from "zustand";

type MapControlStore = {
    isMapReady: boolean;
    isMapExpanded: boolean;
    isFollowingUser: boolean;
    is3D: boolean;
    pitch: number;

    setIsMapReady: (value: boolean) => void;
    setIsMapExpanded: (value: boolean) => void;
    toggleMapExpanded: () => void;
    setIsFollowingUser: (value: boolean) => void;
    setIs3D: (value: boolean) => void;
    setPitch: (value: number) => void;
};

const INITIAL_VALUE = {
    isMapReady: false,
    isMapExpanded: false,
    isFollowingUser: true,
    is3D: false,
    pitch: 0,
};

export const useMapControlStore = create<MapControlStore>((set) => ({
    ...INITIAL_VALUE,
    setIsMapReady: (value) => set({ isMapReady: value }),
    setIsMapExpanded: (value) => set({ isMapExpanded: value }),
    toggleMapExpanded: () =>
        set((state) => ({ isMapExpanded: !state.isMapExpanded })),
    setIsFollowingUser: (value) => set({ isFollowingUser: value }),
    setIs3D: (value) => set({ is3D: value }),
    setPitch: (value) => set({ pitch: value }),
}));
