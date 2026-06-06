import { useSettingsStore } from "../stores/use-settings-store";
import { formatDistanceByUnit } from "../utils/format";

export const useUnit = (v: number, showUnit = true) => {
    const preferences = useSettingsStore((s) => s.settings?.preferences);
    const unit = preferences?.unit;

    return formatDistanceByUnit(v, unit, showUnit);
};
