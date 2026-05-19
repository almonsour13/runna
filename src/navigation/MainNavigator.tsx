import HistoryScreen from "@/features/history/HistoryScreen";
import HomeScreen from "@/features/home/HomeScreen";
import MainTabBar from "@/shared/components/layout/MainTabBar";
import SafeScreen from "@/shared/components/SafeScreen";
import { useActivityTracking } from "@/shared/hooks/use-activity-tracking";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import React from "react";

const Tab = createBottomTabNavigator();

export default function MainNavigator() {
    useActivityTracking();
    return (
        <SafeScreen>
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
        </SafeScreen>
    );
}
