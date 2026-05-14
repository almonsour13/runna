import { StatusBar } from "expo-status-bar";
import { View } from "react-native";
import { useTheme } from "../hooks/use-theme";
import { cn } from "../utils/cn";

export default function ThemeProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const theme = useTheme();
    const isDark = theme === "dark";
    return (
        <View
            className={cn("flex-1 bg-background", theme === "dark" && "dark")}
        >
            {children}
            <StatusBar style={isDark ? "light" : "dark"} />
        </View>
    );
}
