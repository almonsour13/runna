import { ColView } from "@/shared/components/CustomView";
import Text from "@/shared/components/ui/Text";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ActivityDetailsEmptyState() {
    return (
        <SafeAreaView style={{ flex: 1 }}>
            <ColView className="flex-1 justify-center items-center">
                <Text className="text-xl text-muted-foreground">
                    Activity not found.
                </Text>
            </ColView>
        </SafeAreaView>
    );
}
