import HistoryScreen from "@/features/history/HistoryScreen";
import HomeScreen from "@/features/home/HomeScreen";
import MainTabBar from "@/shared/components/layout/MainTabBar";
import { useActivity } from "@/shared/hooks/use-activity";
import { useActivityTracking } from "@/shared/hooks/use-activity-tracking";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";

const Tab = createBottomTabNavigator();

export default function MainNavigator() {
    useActivity();
    useActivityTracking();
    return (
        <SafeAreaView style={{ flex: 1 }}>
            <Tab.Navigator
                screenOptions={{
                    headerShown: false,
                    sceneStyle: {
                        backgroundColor: "transparent",
                    },
                    animation: "shift",
                }}
                tabBar={(props) => <MainTabBar {...props} />}
            >
                <Tab.Screen name="Home" component={HomeScreen} />
                <Tab.Screen name="History" component={HistoryScreen} />
            </Tab.Navigator>
        </SafeAreaView>
    );
}
