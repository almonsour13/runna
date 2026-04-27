import "@/global.css";
import clsx from "clsx";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useColorScheme, View } from "react-native";
import "react-native-reanimated";

export default function RootLayout() {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === "dark";

    return (
        <View className={clsx("bg-background flex-1", isDark ? "dark" : "")}>
            <Stack
                screenOptions={{
                    headerShown: false,
                    contentStyle: { backgroundColor: "transparent" },
                    animation: "none",
                }}
            >
                <Stack.Screen name="(tabs)" />
            </Stack>
            <StatusBar style="auto" />
        </View>
    );
}
