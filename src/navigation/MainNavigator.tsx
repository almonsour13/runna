import HomeScreen from "@/features/home/HomeScreen";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import React from "react";

const Tab = createBottomTabNavigator();

export default function MainNavigator() {
    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                sceneStyle: {
                    backgroundColor: "transparent",
                },
            }}
        >
            <Tab.Screen name="Home" component={HomeScreen} />
        </Tab.Navigator>
    );
}
