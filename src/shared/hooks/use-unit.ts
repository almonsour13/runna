import { useSettingsStore } from "../stores/use-settings-store";

export const useUnit = () => {
    const settings = useSettingsStore((s) => s.preferences);
    const units = settings.unit;
};
