import { ColView } from "@/shared/components/CustomView";
import Text from "@/shared/components/ui/Text";

export default function HistoryHeader() {
    return (
        <ColView className="p-4 pb-0 gap-0">
            <Text className="text-2xl font-medium">History</Text>
            <Text className="text-lg text-muted-foreground">
                Your activity over time
            </Text>
        </ColView>
    );
}
