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

const FILTER_OPTIONS = ["All", "Today", "This Week", "This Month"] as const;
const PAGE_LIMIT = 10;
export default function HistoryScreen() {
    const route = useRoute<HistoryRoute>();

    const { initialFilter } = route.params ?? {};

    const isActivitiesLoading = useActivityStore((state) => state.isLoading);

    const activities = useActivityStore((state) => state.activities);

    const [selectedFilter, setSelectedFilter] = useState(
        initialFilter ?? FILTER_OPTIONS[0],
    );

    const [selectedSortOrder, setSelectedSortOrder] = useState<
        "Oldest" | "Newest"
    >("Newest");

    const [page, setPage] = useState(1);

    useEffect(() => {
        if (route.params?.initialFilter) {
            setSelectedFilter(route.params.initialFilter);
        }
    }, [route.params]);

    useEffect(() => {
        setPage(1);
    }, [selectedFilter, selectedSortOrder]);

    const filteredActivities = useMemo(() => {
        const todayStartDate = new Date();
        todayStartDate.setHours(0, 0, 0, 0);

        const todayEndDate = new Date();
        todayEndDate.setHours(23, 59, 59, 999);

        const todayStartMs = todayStartDate.getTime();

        const todayEndMs = todayEndDate.getTime();

        const currentDate = new Date();

        return activities
            .map((activity) => ({
                ...activity,
                createdAtMs: new Date(activity.createdAt).getTime(),
            }))
            .filter((activity) => {
                if (selectedFilter === "Today") {
                    return (
                        activity.createdAtMs >= todayStartMs &&
                        activity.createdAtMs <= todayEndMs
                    );
                }

                if (selectedFilter === "This Week") {
                    const weekStartDate = new Date();

                    const currentDay = weekStartDate.getDay();

                    weekStartDate.setDate(weekStartDate.getDate() - currentDay);

                    weekStartDate.setHours(0, 0, 0, 0);

                    return (
                        activity.createdAtMs >= weekStartDate.getTime() &&
                        activity.createdAtMs <= todayEndMs
                    );
                }

                if (selectedFilter === "This Month") {
                    const activityDate = new Date(activity.createdAtMs);

                    return (
                        activityDate.getMonth() === currentDate.getMonth() &&
                        activityDate.getFullYear() === currentDate.getFullYear()
                    );
                }

                return true;
            })
            .sort((firstActivity, secondActivity) =>
                selectedSortOrder === "Newest"
                    ? secondActivity.createdAtMs - firstActivity.createdAtMs
                    : firstActivity.createdAtMs - secondActivity.createdAtMs,
            );
    }, [activities, selectedFilter, selectedSortOrder]);

    const paginatedActivities = useMemo(
        () => filteredActivities.slice(0, page * PAGE_LIMIT),
        [filteredActivities, page],
    );

    const hasMore = paginatedActivities.length < filteredActivities.length;

    const handleFilterChange = useCallback(
        (filterValue: (typeof FILTER_OPTIONS)[number]) => {
            setSelectedFilter(filterValue);
        },
        [],
    );

    const toggleSortOrder = useCallback(() => {
        setSelectedSortOrder((previousOrder) =>
            previousOrder === "Newest" ? "Oldest" : "Newest",
        );
    }, []);

    const handleLoadMore = useCallback(() => {
        if (hasMore) setPage((prev) => prev + 1);
    }, [hasMore]);

    const HeaderComponent = () => (
        <ColView>
            <HistoryHeader />

            <RowView className="px-4 gap-1 mb-2 justify-between">
                <RowView className="gap-1">
                    {FILTER_OPTIONS.map((filterOption, index) => (
                        <FilterButton
                            key={index}
                            label={filterOption}
                            active={filterOption === selectedFilter}
                            onPress={() => handleFilterChange(filterOption)}
                        />
                    ))}
                </RowView>

                <FilterButton
                    label={selectedSortOrder}
                    active={selectedSortOrder === "Newest"}
                    onPress={toggleSortOrder}
                />
            </RowView>
        </ColView>
    );

    return (
        <FlatList
            key="history-list"
            data={
                isActivitiesLoading && filteredActivities.length === 0
                    ? []
                    : paginatedActivities // ✅ use paginated slice
            }
            onEndReached={handleLoadMore}
            keyExtractor={(item) => item.id}
            contentContainerClassName="gap-1 pb-28"
            showsVerticalScrollIndicator={false}
            onEndReachedThreshold={0.5}
            maxToRenderPerBatch={10}
            updateCellsBatchingPeriod={50}
            initialNumToRender={10}
            windowSize={10}
            disableIntervalMomentum
            ListHeaderComponent={HeaderComponent}
            ListEmptyComponent={
                isActivitiesLoading ? (
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
            renderItem={({ item }) => (
                <ColView className="px-4">
                    <ActivityCard activity={item} />
                </ColView>
            )}
        />
    );
}
