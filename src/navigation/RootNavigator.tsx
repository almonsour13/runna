import RecordScreen from "@/features/record/screens/RecordScreen";
import ScheduleScreen from "@/features/schedule/screens/ScheduleScreen";
import SplashScreen from "@/screens/SplashScreen";
import { useOnboardingContext } from "@/shared/context/OnboardingContext";
import { useAppInit } from "@/shared/hooks/use-app-init";
import { RootStackParamList } from "@/shared/types/type";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ActivityDetailsNavigator from "./ActivityDetailsNavigator";
import MainNavigator from "./MainNavigator";
import OnboardingNavigator from "./OnboardingNavigator";
import ProfileNavigator from "./ProfileNavigator";
import SettingsNavigator from "./SettingsNavigator";

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
    const { isOnboarded } = useOnboardingContext();
    const { isReady } = useAppInit();

    if (!isReady) {
        return <SplashScreen />;
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
                            name="Record"
                            component={RecordScreen}
                            options={{
                                animation: "fade",
                            }}
                        />
                        <Stack.Screen
                            name="ActivityDetails"
                            component={ActivityDetailsNavigator}
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
