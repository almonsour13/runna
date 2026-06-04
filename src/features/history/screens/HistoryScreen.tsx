import ActivityCard from "@/shared/components/ActivityCard";
import { ColView, RowView } from "@/shared/components/CustomView";
import Card from "@/shared/components/ui/Card";
import Drawer, { DrawerHandle } from "@/shared/components/ui/Drawer";
import Icon from "@/shared/components/ui/Icon";
import Text from "@/shared/components/ui/Text";
import { activityService } from "@/shared/services/storage/activity.service";
import { Activity } from "@/shared/types/type";
import { cn } from "@/shared/utils/cn";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useCallback, useRef, useState } from "react";
import { FlatList, TouchableOpacity } from "react-native";
import FilterButton from "../components/FilterButton";
import HistoryHeader from "../components/HistoryHeader";

const PAGE_LIMIT = 10;

const ORDER_BY_OPTIONS: {
    label: string;
    value: keyof Activity;
    asc: string;
    desc: string;
}[] = [
    {
        label: "Date",
        value: "createdAt",
        asc: "Oldest",
        desc: "Newest",
    },
    { label: "Distance", value: "distance", asc: "Shortest", desc: "Longest" },
    { label: "Duration", value: "duration", asc: "Shortest", desc: "Longest" },
    { label: "Calories", value: "calories", asc: "Fewest", desc: "Most" },
    { label: "Steps", value: "steps", asc: "Fewest", desc: "Most" },
    { label: "Type", value: "type", asc: "A → Z", desc: "Z → A" },
];

export default function HistoryScreen() {
    const [orderBy, setOrderBy] = useState<keyof Activity>("createdAt");
    const [orderDirection, setOrderDirection] = useState<"asc" | "desc">(
        "desc",
    );
    const orderByDrawer = useRef<DrawerHandle>(null);

    const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } =
        useInfiniteQuery({
            queryKey: ["history", "activities", orderBy, orderDirection],
            queryFn: async ({ pageParam = 0 }) => {
                return await activityService.get({
                    limit: PAGE_LIMIT,
                    offset: pageParam * PAGE_LIMIT,
                    orderBy,
                    orderDirection,
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

    const activeOrder = ORDER_BY_OPTIONS.find((o) => o.value === orderBy)!;
    const activeOrderDirection =
        orderDirection === "desc" ? activeOrder.desc : activeOrder.asc;
    const orderByLabel = [activeOrder.label, activeOrderDirection].join(" • ");

    const HeaderComponent = useCallback(
        () => (
            <ColView>
                <HistoryHeader />
                <RowView className="px-4 gap-1 mb-2 justify-end">
                    <FilterButton
                        label={orderByLabel}
                        active={orderBy !== null}
                        onPress={() => orderByDrawer.current?.open()}
                    />
                </RowView>
            </ColView>
        ),
        [],
    );

    return (
        <>
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
                        <ColView className="px-4 gap-1">
                            {Array.from({ length: PAGE_LIMIT }).map((_, i) => (
                                <Card key={i} className="h-22" />
                            ))}
                        </ColView>
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
                        <ColView className="px-4 gap-1">
                            {Array.from({ length: PAGE_LIMIT }).map((_, i) => (
                                <Card key={i} className="h-22" />
                            ))}
                        </ColView>
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
            <Drawer ref={orderByDrawer}>
                <ColView className="gap-4 py-4">
                    <RowView className="justify-center">
                        <Text className="text-lg font-medium">Order By</Text>
                    </RowView>
                    <ColView className="gap-0">
                        {ORDER_BY_OPTIONS.map((option) => {
                            const { value, label } = option;
                            const isSelected = orderBy === value;
                            return (
                                <TouchableOpacity
                                    key={label}
                                    className={cn(
                                        "p-4 px-8 h-16 justify-center",
                                        isSelected && "bg-muted",
                                    )}
                                    onPress={() => {
                                        if (isSelected) {
                                            setOrderDirection((d) =>
                                                d === "asc" ? "desc" : "asc",
                                            );
                                        } else {
                                            setOrderBy(value);
                                            setOrderDirection("desc"); // reset to default
                                        }
                                        // orderByDrawer.current?.close();
                                    }}
                                >
                                    <RowView className="justify-between">
                                        <Text
                                            className={cn(
                                                "text-lg capitalize",
                                                isSelected && "text-primary",
                                            )}
                                        >
                                            {label}
                                        </Text>
                                        <RowView className="gap-2 items-center">
                                            {isSelected ? (
                                                <>
                                                    <Text className="text-sm text-primary">
                                                        {orderDirection ===
                                                        "desc"
                                                            ? option.desc
                                                            : option.asc}
                                                    </Text>
                                                    <Icon
                                                        name={
                                                            orderDirection ===
                                                            "desc"
                                                                ? "arrow-down"
                                                                : "arrow-up"
                                                        }
                                                        size={14}
                                                        className="text-primary"
                                                    />
                                                </>
                                            ) : (
                                                <Text className="text-sm text-muted-foreground">
                                                    {option.desc}
                                                </Text>
                                            )}
                                        </RowView>
                                    </RowView>
                                </TouchableOpacity>
                            );
                        })}
                    </ColView>
                </ColView>
            </Drawer>
        </>
    );
}
