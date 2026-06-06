import SettingsScreen from "@/features/settings/screens/SettingsScreen";
import ThemeScreen from "@/features/settings/screens/ThemeScreen";
import SafeScreen from "@/shared/components/SafeScreen";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

const Stack = createNativeStackNavigator();
export default function SettingsNavigator() {
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
                    name="SettingsScreen"
                    component={SettingsScreen}
                />
                <Stack.Screen name="Theme" component={ThemeScreen} />
            </Stack.Navigator>
        </SafeScreen>
    );
}
