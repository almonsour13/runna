import { useEffect, useState } from "react";
import { profileService } from "../services/storage/profile.service";
import { settingsService } from "../services/storage/settings.service";
import { useProfileStore } from "../stores/use-profile.store";
import { useSettingsStore } from "../stores/use-settings-store";

export const useAppInit = () => {
    const setProfile = useProfileStore((s) => s.setProfile);
    const setSettings = useSettingsStore((s) => s.setSettings);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        async function init() {
            try {
                const [profile, settings] = await Promise.all([
                    profileService.get(),
                    settingsService.get(),
                ]);
                setProfile(profile);
                setSettings(settings);
            } catch (err) {
                setError(
                    err instanceof Error
                        ? err
                        : new Error("Failed to initialize app data"),
                );
            } finally {
                setIsLoading(false);
            }
        }
        init();
    }, []);

    return { isLoading, error };
};
