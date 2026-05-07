import { ColView } from "@/shared/components/CustomView";
import Text from "@/shared/components/ui/Text";

export default function HistoryHeader() {
    return (
        <ColView className="px-4 pt-8 gap-0.5 pb-4">
            <Text className="text-2xl font-medium text-foreground">
                History
            </Text>
            <Text className="text-sm text-muted-foreground">
                Your activity over time
            </Text>
        </ColView>
    );
}
