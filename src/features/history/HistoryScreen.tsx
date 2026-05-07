import ActivityCard from "@/shared/components/ActivityCard";
import { ColView, RowView } from "@/shared/components/CustomView";
import Text from "@/shared/components/ui/Text";
import { useActivityStore } from "@/shared/stores/use-activity.store";
import { ActivityIndicator, Dimensions, FlatList } from "react-native";
import HistoryHeader from "./components/HistoryHeader";

const { width } = Dimensions.get("window");
export default function HistoryScreen() {
    const isLoading = useActivityStore((s) => s.isLoading);
    const activities = useActivityStore((s) => s.activities);

    const RenderHeader = () => (
        <ColView>
            <HistoryHeader />
        </ColView>
    );
    return (
        <FlatList
            key="history-list"
            data={isLoading && activities.length === 0 ? [] : activities}
            contentContainerClassName="gap-1 pb-28"
            showsVerticalScrollIndicator={false}
            onEndReachedThreshold={0.5}
            maxToRenderPerBatch={10}
            updateCellsBatchingPeriod={50}
            initialNumToRender={10}
            windowSize={10}
            disableIntervalMomentum={true}
            ListHeaderComponent={RenderHeader}
            ListEmptyComponent={
                isLoading ? (
                    <RowView className="justify-center py-8">
                        <ActivityIndicator size="large" />
                    </RowView>
                ) : (
                    <RowView className="justify-center py-8">
                        <Text className="text-muted-foreground">
                            No activity history
                        </Text>
                    </RowView>
                )
            }
            renderItem={({ item }) => {
                return (
                    <ColView key={item.id} className="px-4">
                        <ActivityCard activity={item} />
                    </ColView>
                );
            }}
        />
    );
}
