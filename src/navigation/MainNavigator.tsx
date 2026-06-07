import HistoryScreen from "@/features/history/screens/HistoryScreen";
import HomeScreen from "@/features/home/screens/HomeScreen";
import { useRecord } from "@/features/record/hooks/use-record-tracking";
import StatisticScreen from "@/features/statistic/screens/StatisticScreen";
import WelcomeDrawer from "@/shared/components/drawer/WelcomeDrawer";
import MainTabBar from "@/shared/components/layout/MainTabBar";
import SafeScreen from "@/shared/components/SafeScreen";
import "@/shared/db/seed/activity.seed";
import "@/shared/db/seed/schedule.seed";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import React from "react";
const Tab = createBottomTabNavigator();

export default function MainNavigator() {
    useRecord();
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
                <Tab.Screen name="Statistic" component={StatisticScreen} />
                <Tab.Screen name="History" component={HistoryScreen} />
            </Tab.Navigator>
            <WelcomeDrawer />
        </SafeScreen>
    );
}
