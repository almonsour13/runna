import OnboardingIntroScreen from "@/features/onboarding/OnboardingScreen";
import OnboardingStepsScreen from "@/features/onboarding/OnboardingStepsScreen";
import SafeScreen from "@/shared/components/SafeScreen";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

const Stack = createNativeStackNavigator();
export default function OnboardingNavigator() {
    return (
        <SafeScreen>
            <Stack.Navigator
                screenOptions={{
                    headerShown: false,
                    contentStyle: {
                        backgroundColor: "transparent",
                    },
                    animation: "slide_from_right",
                }}
            >
                <Stack.Screen
                    name="OnboardingIntro"
                    component={OnboardingIntroScreen}
                />
                <Stack.Screen
                    name="OnboardingSteps"
                    component={OnboardingStepsScreen}
                />
            </Stack.Navigator>
        </SafeScreen>
    );
}
