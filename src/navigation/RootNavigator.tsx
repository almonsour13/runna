import ActivityDetailsScreen from "@/features/ActivityDetails/ActivityDetailsScreen";
import ActivityTrackingScreen from "@/features/ActivityTracking/ActivityTrackingScreen";
import {
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_600SemiBold,
    DMSans_700Bold,
    useFonts,
} from "@expo-google-fonts/dm-sans";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import MainNavigator from "./MainNavigator";

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
    const [loaded] = useFonts({
        DMSans_400Regular,
        DMSans_500Medium,
        DMSans_600SemiBold,
        DMSans_700Bold,
    });
    if (!loaded) {
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
            </Stack.Navigator>
        </NavigationContainer>
    );
}
