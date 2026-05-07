import ActivityCard from "@/shared/components/ActivityCard";
import { ColView, RowView } from "@/shared/components/CustomView";
import Text from "@/shared/components/ui/Text";
import { useActivityStore } from "@/shared/stores/use-activity.store";
import { RootStackParamList } from "@/shared/types/type";
import { RouteProp, useRoute } from "@react-navigation/native";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, FlatList } from "react-native";
import FilterButton from "./components/FilterButton";
import HistoryHeader from "./components/HistoryHeader";

type HistoryRoute = RouteProp<RootStackParamList, "History">;
const filter = ["All", "Today", "This Week", "This Month"];
export default function HistoryScreen() {
    const route = useRoute<HistoryRoute>();
    const { initialFilter } = route.params ?? {};
    const isLoading = useActivityStore((s) => s.isLoading);
    const activities = useActivityStore((s) => s.activities);
    const [selectedFilter, setSelectedFilter] = useState(
        initialFilter ?? filter[0],
    );
    const [sort, setSort] = useState<"Oldest" | "Newest">("Newest");

    useEffect(() => {
        if (route.params?.initialFilter) {
            setSelectedFilter(route.params.initialFilter);
        }
    }, [route.params]);

    const filteredActivities = useMemo(() => {
        const now = Date.now();

        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);
        const startToday = startOfToday.getTime();

        const endToday = new Date();
        endToday.setHours(23, 59, 59, 999);
        const end = endToday.getTime();

        return activities
            .map((a) => ({
                ...a,
                createdAtMs: new Date(a.createdAt).getTime(), // ✅ compute once
            }))
            .filter((a) => {
                if (selectedFilter === "Today") {
                    return a.createdAtMs >= startToday && a.createdAtMs <= end;
                }

                if (selectedFilter === "This Week") {
                    const start = new Date();
                    const day = start.getDay();
                    start.setDate(start.getDate() - day);
                    start.setHours(0, 0, 0, 0);

                    return (
                        a.createdAtMs >= start.getTime() && a.createdAtMs <= end
                    );
                }

                if (selectedFilter === "This Month") {
                    const d = new Date(a.createdAtMs);
                    return (
                        d.getMonth() === new Date().getMonth() &&
                        d.getFullYear() === new Date().getFullYear()
                    );
                }

                return true;
            })
            .sort((a, b) =>
                sort === "Newest"
                    ? b.createdAtMs - a.createdAtMs
                    : a.createdAtMs - b.createdAtMs,
            );
    }, [activities, selectedFilter, sort]);

    const handleFilterChange = useCallback((f: string) => {
        setSelectedFilter(f);
    }, []);

    const toggleSort = useCallback(() => {
        setSort((prev) => (prev === "Newest" ? "Oldest" : "Newest"));
    }, []);

    const RenderHeader = () => (
        <ColView>
            <HistoryHeader />
            <RowView className="px-4 gap-1 mb-2 justify-between">
                <RowView className="gap-1 ">
                    {filter.map((f, index) => {
                        return (
                            <FilterButton
                                label={f}
                                active={f === selectedFilter}
                                onPress={() => handleFilterChange(f)}
                                key={index}
                            />
                        );
                    })}
                </RowView>
                <FilterButton
                    label={sort}
                    active={sort === "Newest"}
                    onPress={toggleSort}
                />
            </RowView>
        </ColView>
    );
    return (
        <FlatList
            key="history-list"
            data={
                isLoading && filteredActivities.length === 0
                    ? []
                    : filteredActivities
            }
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
