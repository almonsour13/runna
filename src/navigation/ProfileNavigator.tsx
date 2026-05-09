import ProfileEditScreen from "@/features/profile/ProfileEditScreen";
import ProfileScreen from "@/features/profile/ProfileScreen";
import SafeScreen from "@/shared/components/SafeScreen";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

export type ProfileStackParamList = {
    ProfileScreen: undefined;
    ProfileEdit: undefined;
};

const Stack = createNativeStackNavigator<ProfileStackParamList>();
export default function ProfileNavigator() {
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
                <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
                <Stack.Screen
                    name="ProfileEdit"
                    component={ProfileEditScreen}
                />
            </Stack.Navigator>
        </SafeScreen>
    );
}
