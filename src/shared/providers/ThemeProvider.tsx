import { useSettingsStore } from "@/shared/stores/use-settings-store";
import { StatusBar } from "expo-status-bar";
import { View, useColorScheme as useDeviceColorScheme } from "react-native";
import { cn } from "../utils/cn";

export default function ThemeProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const theme = useSettingsStore((s) => s.preferences.theme);
    const deviceTheme = useDeviceColorScheme();

    const activeTheme = theme === "system" ? (deviceTheme ?? "light") : theme;

    const isDark = activeTheme === "dark";
    return (
        <View
            className={cn(
                "flex-1 bg-background",
                activeTheme === "dark" && "dark",
            )}
        >
            {children}
            <StatusBar style={isDark ? "light" : "dark"} />
        </View>
    );
}
