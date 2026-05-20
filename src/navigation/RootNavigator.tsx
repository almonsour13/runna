import ActivityDetailsScreen from "@/features/ActivityDetails/ActivityDetailsScreen";
import ActivityTrackingScreen from "@/features/ActivityTracking/ActivityTrackingScreen";
import ScheduleScreen from "@/features/schedule/ScheduleScreen";
import { useOnboardingContext } from "@/shared/context/OnboardingContext";
import { db } from "@/shared/db";
import migrations from "@/shared/db/migrations/migrations";
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
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import MainNavigator from "./MainNavigator";
import OnboardingNavigator from "./OnboardingNavigator";
import ProfileNavigator from "./ProfileNavigator";
import SettingsNavigator from "./SettingsNavigator";

SplashScreen.preventAutoHideAsync();
const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
    const { isOnboarded } = useOnboardingContext();
    const { success } = useMigrations(db, migrations);
    const [loaded] = useFonts({
        DMSans_400Regular,
        DMSans_500Medium,
        DMSans_600SemiBold,
        DMSans_700Bold,
    });
    const { isLoading } = useAppInit();

    const isReady = loaded && success && !isLoading;

    useEffect(() => {
        if (isReady) {
            SplashScreen.hideAsync();
        }
    }, [isReady]);

    useEffect(() => {
        async function init() {
            // await seed({
            //     days: 30,
            //     sessionMinPerDay: 2,
            //     sessionMaxPerDay: 3,
            // });
            // await seedSchedule({
            //     count: 7,
            // });
        }
        init();
    }, []);

    if (!isReady) {
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
                {!isOnboarded ? (
                    <Stack.Screen
                        name="Onboarding"
                        component={OnboardingNavigator}
                        options={{
                            animation: "fade",
                        }}
                    />
                ) : (
                    <>
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

                        <Stack.Screen
                            name="Schedule"
                            component={ScheduleScreen}
                            options={{
                                animation: "slide_from_right",
                            }}
                        />
                    </>
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
}
