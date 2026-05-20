import { ColView } from "@/shared/components/CustomView";
import Text from "@/shared/components/ui/Text";
import { NavigationProp } from "@/shared/types/type";
import { useNavigation } from "@react-navigation/native";
import { TouchableOpacity, View } from "react-native";

export default function OnboardingIntroScreen() {
    const navigation = useNavigation<NavigationProp>();
    return (
        <ColView className="flex-1 gap-8">
            <ColView className="flex-1">
                <ColView className="flex-1 justify-center items-center" />
                <ColView className="px-4 justify-center items-center gap-4">
                    <Text className="text-4xl font-semibold text-center">
                        Run Further. Feel Better.
                    </Text>
                    <Text className="text-base text-muted-foreground text-center leading-relaxed">
                        Track every kilometer, hit your personal bests, and stay
                        consistent — one run at a time.
                    </Text>
                </ColView>
            </ColView>
            <View className="px-4 pb-12">
                <TouchableOpacity
                    className="h-16 rounded-full justify-center items-center bg-primary "
                    onPress={() =>
                        navigation.navigate("Onboarding", {
                            screen: "OnboardingSteps",
                        })
                    }
                >
                    <Text className="text-white font-medium">Get Started</Text>
                </TouchableOpacity>
            </View>
        </ColView>
    );
}
