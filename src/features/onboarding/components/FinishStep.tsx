import { ColView } from "@/shared/components/CustomView";
import Icon from "@/shared/components/ui/Icon";
import Text from "@/shared/components/ui/Text";
import { Dimensions, View } from "react-native";

const { width } = Dimensions.get("window");
export default function FinishStep() {
    return (
        <ColView className="flex-1 gap-12" style={{ width }}>
            <ColView className="px-4 justify-center gap-4">
                <Text className="text-4xl font-semibold">
                    You're ready{"\n"}to go!
                </Text>
                <Text className="text-base text-muted-foreground leading-relaxed">
                    Your profile is set up. Start tracking your steps and hit
                    your first goal today.
                </Text>
            </ColView>
            <View className="flex-1 justify-center items-center">
                <Icon name="checkmark" size={200} className="text-primary" />
            </View>
        </ColView>
    );
}
