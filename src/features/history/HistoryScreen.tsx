import ActivityCard from "@/shared/components/ActivityCard";
import { ColView, RowView } from "@/shared/components/CustomView";
import Text from "@/shared/components/ui/Text";
import { activityService } from "@/shared/services/storage/activity.service";
import { RootStackParamList } from "@/shared/types/type";
import { RouteProp } from "@react-navigation/native";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { ActivityIndicator, FlatList } from "react-native";
import FilterButton from "./components/FilterButton";
import HistoryHeader from "./components/HistoryHeader";

type HistoryRoute = RouteProp<RootStackParamList, "History">;

const PAGE_LIMIT = 10;

export default function HistoryScreen() {
    const [selectedSortOrder, setSelectedSortOrder] = useState<
        "Oldest" | "Newest"
    >("Newest");

    const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } =
        useInfiniteQuery({
            queryKey: ["history", "activities", selectedSortOrder],
            queryFn: async ({ pageParam = 0 }) => {
                return await activityService.get({
                    limit: PAGE_LIMIT,
                    offset: pageParam * PAGE_LIMIT,
                    orderDirection:
                        selectedSortOrder === "Newest" ? "desc" : "asc",
                });
            },
            getNextPageParam: (lastPage, allPages) =>
                lastPage.length === PAGE_LIMIT ? allPages.length : undefined,
            initialPageParam: 0,
        });

    const activities = data?.pages.flatMap((page) => page) ?? [];

    const handleLoadMore = useCallback(() => {
        if (isFetchingNextPage || !hasNextPage) return;
        fetchNextPage();
    }, [isFetchingNextPage, hasNextPage, fetchNextPage]);

    const toggleSortOrder = useCallback(() => {
        setSelectedSortOrder((prev) =>
            prev === "Newest" ? "Oldest" : "Newest",
        );
    }, []);

    const HeaderComponent = useCallback(
        () => (
            <ColView>
                <HistoryHeader />
                <RowView className="px-4 gap-1 mb-2 justify-between">
                    <FilterButton
                        label={selectedSortOrder}
                        active={selectedSortOrder === "Newest"}
                        onPress={toggleSortOrder}
                    />
                </RowView>
            </ColView>
        ),
        [selectedSortOrder, toggleSortOrder],
    );

    return (
        <FlatList
            key="history-list"
            data={activities}
            onEndReached={handleLoadMore}
            keyExtractor={(item) => item.id.toString()}
            contentContainerClassName="gap-1 pb-28"
            showsVerticalScrollIndicator={false}
            onEndReachedThreshold={0.5}
            maxToRenderPerBatch={10}
            updateCellsBatchingPeriod={50}
            initialNumToRender={10}
            windowSize={10}
            disableIntervalMomentum
            ListHeaderComponent={HeaderComponent}
            ListFooterComponent={
                isFetchingNextPage ? (
                    <RowView className="justify-center py-4">
                        <ActivityIndicator size="small" />
                    </RowView>
                ) : !hasNextPage && activities.length > 0 ? (
                    <RowView className="justify-center py-4">
                        <Text className="text-muted-foreground">
                            No more activities
                        </Text>
                    </RowView>
                ) : null
            }
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
            renderItem={({ item }) => (
                <ColView className="px-4">
                    <ActivityCard activity={item} />
                </ColView>
            )}
        />
    );
}
