import { ColView } from "@/shared/components/CustomView";
import Text from "@/shared/components/ui/Text";

export default function StatisticHeader() {
    return (
        <ColView className="p-4 pb-0 gap-0">
            <Text className="text-2xl font-medium">Statistic</Text>
            <Text className="text-lg text-muted-foreground">
                Your activity statistics over time
            </Text>
        </ColView>
    );
}
