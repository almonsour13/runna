import { useFonts } from "@expo-google-fonts/dm-sans";
import { useEffect, useState } from "react";

import {
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_600SemiBold,
    DMSans_700Bold,
} from "@expo-google-fonts/dm-sans";

import { initDb } from "../db/init-db";
import { profileService } from "../services/storage/profile.service";
import { settingsService } from "../services/storage/settings.service";
import { useProfileStore } from "../stores/use-profile.store";
import { useSettingsStore } from "../stores/use-settings-store";

export const useAppInit = () => {
    const setProfile = useProfileStore((s) => s.setProfile);
    const setSettings = useSettingsStore((s) => s.setSettings);

    const [fontsLoaded] = useFonts({
        DMSans_400Regular,
        DMSans_500Medium,
        DMSans_600SemiBold,
        DMSans_700Bold,
    });

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        let mounted = true;

        async function init() {
            try {
                // 1. DB FIRST
                await initDb();

                // 2. LOAD APP DATA
                const [profile, settings] = await Promise.all([
                    profileService.get(),
                    settingsService.get(),
                ]);

                if (!mounted) return;

                setProfile(profile);
                setSettings(settings);
            } catch (err) {
                if (!mounted) return;

                setError(
                    err instanceof Error
                        ? err
                        : new Error("Failed to initialize app data"),
                );
            } finally {
                if (mounted) setIsLoading(false);
            }
        }

        init();

        return () => {
            mounted = false;
        };
    }, []);

    // 🔥 unified readiness state
    const isReady = fontsLoaded && !isLoading;

    return { isReady, isLoading, error };
};
