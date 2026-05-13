import { Profile } from "@/shared/types/type";
import { create } from "zustand";

type ProfileStore = {
    isLoading: boolean;
    profile: Profile | null;
    setProfile: (profile: Profile | null) => Promise<void>;
    updateProfile: (partial: Partial<Profile>) => Promise<void>;
    setField: <K extends keyof Profile>(key: K, value: Profile[K]) => void;
};

export const useProfileStore = create<ProfileStore>((set, get) => ({
    profile: null,
    isLoading: false,

    setProfile: async (profile) => {
        set({ profile });
    },

    updateProfile: async (partial) => {
        const current = get().profile;
        if (!current) return;

        const updated = {
            ...current,
            ...partial,
        };

        set({ profile: updated });
    },

    setField: (key, value) =>
        set((state) => {
            if (!state.profile) return state;
            return { profile: { ...state.profile, [key]: value } };
        }),
}));
