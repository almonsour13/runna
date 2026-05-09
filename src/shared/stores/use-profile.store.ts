import { Profile } from "@/shared/types/type";
import { create } from "zustand";

type ProfileStore = {
    profile: Profile | null;
    setProfile: (profile: Profile | null) => void;
    setName: (name: string) => void;
    setAge: (age: number) => void;
    setWeight: (weight: number) => void;
    setHeight: (height: number) => void;
    setGender: (gender: "male" | "female") => void;
    setGoal: (goal: number) => void;
};

export const useProfileStore = create<ProfileStore>((set, get) => ({
    profile: {
        id: "",
        name: "Al Monsour",
        age: 23,
        weight: 65,
        height: 166,
        gender: "male",
        goal: 5000,
    },

    setProfile: (profile) => set({ profile }),

    setName: (name) =>
        set((state) => {
            if (!state.profile) return state;
            return {
                profile: {
                    ...state.profile,
                    name,
                },
            };
        }),

    setAge: (age) =>
        set((state) => {
            if (!state.profile) return state;
            return {
                profile: {
                    ...state.profile,
                    age,
                },
            };
        }),

    setWeight: (weight) =>
        set((state) => {
            if (!state.profile) return state;
            return {
                profile: {
                    ...state.profile,
                    weight,
                },
            };
        }),

    setHeight: (height) =>
        set((state) => {
            if (!state.profile) return state;
            return {
                profile: {
                    ...state.profile,
                    height,
                },
            };
        }),

    setGender: (gender) =>
        set((state) => {
            if (!state.profile) return state;
            return {
                profile: {
                    ...state.profile,
                    gender,
                },
            };
        }),

    setGoal: (goal) =>
        set((state) => {
            if (!state.profile) return state;
            return {
                profile: {
                    ...state.profile,
                    goal,
                },
            };
        }),
}));
