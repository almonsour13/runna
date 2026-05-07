import HomeScreen from "@/features/home/HomeScreen";
import MainTabBar from "@/shared/components/layout/MainTabBar";
import { useActivity } from "@/shared/hooks/use-activity";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";

const Tab = createBottomTabNavigator();

export default function MainNavigator() {
    useActivity();
    return (
        <SafeAreaView style={{ flex: 1 }}>
            <Tab.Navigator
                screenOptions={{
                    headerShown: false,
                    sceneStyle: {
                        backgroundColor: "transparent",
                    },
                }}
                tabBar={(props) => <MainTabBar {...props} />}
            >
                <Tab.Screen name="Home" component={HomeScreen} />
            </Tab.Navigator>
        </SafeAreaView>
    );
}
