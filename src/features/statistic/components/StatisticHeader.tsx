import { ColView } from "@/shared/components/CustomView";
import Text from "@/shared/components/ui/Text";

export default function StatisticHeader() {
    return (
        <ColView className="px-4 pt-8 gap-1">
            <Text className="text-2xl font-medium text-foreground">
                Statistic
            </Text>
            <Text className="text-sm text-muted-foreground">
                Your activity over time
            </Text>
        </ColView>
    );
}
