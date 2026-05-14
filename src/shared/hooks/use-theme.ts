import { useColorScheme as useDeviceColorScheme } from "react-native";
import { useSettingsStore } from "../stores/use-settings-store";

export const useTheme = () => {
    const settings = useSettingsStore((s) => s.settings);
    const preferences = settings?.preferences;
    const theme = preferences?.theme || "system";
    const deviceTheme = useDeviceColorScheme();

    const activeTheme = theme === "system" ? (deviceTheme ?? "light") : theme;

    return activeTheme;
};
