import ActivityDetailsProvider from "@/features/ActivityDetails/context/ActivityDetailsContext";
import ActivityDetailsScreen from "@/features/ActivityDetails/screens/ActivityDetailsScreen";
import ActivityDetailsShareScreen from "@/features/ActivityDetails/screens/ActivityDetailsShareScreen";
import SafeScreen from "@/shared/components/SafeScreen";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

const Stack = createNativeStackNavigator();
export default function ActivityDetailsNavigator() {
    return (
        <ActivityDetailsProvider>
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
                        name="ActivityDetailsScreen"
                        component={ActivityDetailsScreen}
                    />
                    <Stack.Screen
                        name="ActivityDetailsShareScreen"
                        component={ActivityDetailsShareScreen}
                    />
                </Stack.Navigator>
            </SafeScreen>
        </ActivityDetailsProvider>
    );
}
