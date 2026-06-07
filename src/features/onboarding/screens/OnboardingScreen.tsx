import { ColView } from "@/shared/components/CustomView";
import Card from "@/shared/components/ui/Card";
import Text from "@/shared/components/ui/Text";
import { NavigationProp } from "@/shared/types/type";
import { useNavigation } from "@react-navigation/native";
import Constants from "expo-constants";
import { Image, TouchableOpacity, View } from "react-native";

const config = Constants.expoConfig;
const AppName = config?.name;
const description = config?.description;

export default function OnboardingIntroScreen() {
    const navigation = useNavigation<NavigationProp>();
    return (
        <ColView className="flex-1 gap-8">
            <ColView className="flex-1">
                <ColView className="flex-1 justify-center items-center">
                    <ColView className="justify-center items-center">
                        <Image
                            source={require("../../../../assets/images/splash-icon.png")}
                            style={{ width: 120, height: 120 }}
                            resizeMode="contain"
                        />
                    </ColView>
                </ColView>
                <ColView className="px-4 justify-center items-center gap-4">
                    <Text className="text-4xl font-medium text-center">
                        Track your activity. Feel Better.
                    </Text>
                    <Text className="text-base text-muted-foreground text-center leading-relaxed">
                        Track every kilometer, hit your personal bests, and stay
                        consistent — one run at a time.
                    </Text>
                </ColView>
            </ColView>
            <View className="px-4 pb-12">
                <TouchableOpacity
                    onPress={() =>
                        navigation.navigate("Onboarding", {
                            screen: "OnboardingSteps",
                        })
                    }
                >
                    <Card className="h-16 justify-center items-center bg-primary ">
                        <Text className="text-white text-lg font-medium">
                            Get Started
                        </Text>
                    </Card>
                </TouchableOpacity>
            </View>
        </ColView>
    );
}
