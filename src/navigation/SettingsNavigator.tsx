import ThemeScreen from "@/features/settings/screens/ThemeScreen";
import UnitsScreen from "@/features/settings/screens/UnitsScreen";
import SettingsScreen from "@/features/settings/SettingsScreen";
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
                <Stack.Screen name="Unit" component={UnitsScreen} />
            </Stack.Navigator>
        </SafeScreen>
    );
}
