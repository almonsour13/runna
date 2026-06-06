import { ColView } from "@/shared/components/CustomView";
import Icon from "@/shared/components/ui/Icon";
import Text from "@/shared/components/ui/Text";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ActivityDetailsEmptyState() {
    return (
        <SafeAreaView style={{ flex: 1 }}>
            <ColView className="flex-1 py-8 justify-center items-center gap-2">
                <View className="w-16 h-16 rounded-full bg-muted items-center justify-center">
                    <Icon
                        name="footsteps-outline"
                        size={24}
                        className="text-muted-foreground"
                    />
                </View>
                <Text className="text-base font-medium">
                    Activity not found
                </Text>
                <Text className="text-sm text-muted-foreground text-center px-6">
                    The activity you are looking for doesn't exist or may have
                    been deleted.
                </Text>
            </ColView>
        </SafeAreaView>
    );
}
