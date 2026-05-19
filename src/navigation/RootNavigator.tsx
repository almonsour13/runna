import ActivityDetailsScreen from "@/features/ActivityDetails/ActivityDetailsScreen";
import ActivityTrackingScreen from "@/features/ActivityTracking/ActivityTrackingScreen";
import { db } from "@/shared/db";
import migrations from "@/shared/db/migrations/migrations";
import { seed } from "@/shared/db/seed";
import { useAppInit } from "@/shared/hooks/use-app-init";
import { RootStackParamList } from "@/shared/types/type";
import {
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_600SemiBold,
    DMSans_700Bold,
    useFonts,
} from "@expo-google-fonts/dm-sans";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useMigrations } from "drizzle-orm/expo-sqlite/migrator";
import { useEffect } from "react";
import MainNavigator from "./MainNavigator";
import ProfileNavigator from "./ProfileNavigator";
import SettingsNavigator from "./SettingsNavigator";

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
    const { success, error: migrationError } = useMigrations(db, migrations);
    const [loaded, error] = useFonts({
        DMSans_400Regular,
        DMSans_500Medium,
        DMSans_600SemiBold,
        DMSans_700Bold,
    });
    const { isLoading, error: appInitError } = useAppInit();

    useEffect(() => {
        async function init() {
            await seed({
                days: 30,
                sessionMinPerDay: 2,
                sessionMaxPerDay: 3,
            });
        }
        // init();
    }, []);
    if (!loaded || !success || isLoading) {
        return null;
    }
    return (
        <NavigationContainer>
            <Stack.Navigator
                screenOptions={{
                    headerShown: false,
                    contentStyle: {
                        backgroundColor: "transparent",
                    },
                }}
            >
                <Stack.Screen name="Main" component={MainNavigator} />
                <Stack.Screen
                    name="ActivityTracking"
                    component={ActivityTrackingScreen}
                    options={{
                        animation: "fade",
                    }}
                />
                <Stack.Screen
                    name="ActivityDetails"
                    component={ActivityDetailsScreen}
                    options={{
                        animation: "slide_from_right",
                    }}
                />
                <Stack.Screen
                    name="Settings"
                    component={SettingsNavigator}
                    options={{
                        animation: "slide_from_right",
                    }}
                />
                <Stack.Screen
                    name="Profile"
                    component={ProfileNavigator}
                    options={{
                        animation: "slide_from_right",
                    }}
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
}
