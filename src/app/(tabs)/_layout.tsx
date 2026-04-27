import MainNavigation from "@/shared/components/layout/MainNavigation";
import { Stack } from "expo-router";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";

export default function TabLayout() {
    return (
        <>
            <SafeAreaView style={{ flex: 1 }}>
                <Stack
                    screenOptions={{
                        headerShown: false,
                        contentStyle: { backgroundColor: "transparent" },
                        animation: "none",
                    }}
                />
                <MainNavigation />
            </SafeAreaView>
        </>
    );
}
