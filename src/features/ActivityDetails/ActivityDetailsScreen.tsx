import { ColView } from "@/shared/components/CustomView";
import SafeScreen from "@/shared/components/SafeScreen";
import { activityService } from "@/shared/services/storage/activity.service";
import { Coordinate } from "@/shared/types/type";
import { computeKmSplits } from "@/shared/utils/compute";
import { useRoute } from "@react-navigation/native";
import { useQueries } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import {
    ActivityIndicator,
    RefreshControl,
    ScrollView,
    View,
} from "react-native";
import ActivityDetailsEmptyState from "./Components/ActivityDetailsEmptyState";
import ActivityDetailsMap from "./Components/ActivityDetailsMap";
import ActivityDetailsSplits from "./Components/ActivityDetailsSplits";
import ActivitySummary from "./Components/ActivityDetailsSummary";
import ActivityDetailsHeader from "./Components/layout/ActivityDetailsHeader";

export type KmSplits = {
    km: number;
    durationSec: number;
    paceMinkm: number;
    coord: Coordinate;
}[];

export default function ActivityDetailsScreen() {
    const route = useRoute();
    const { activityId } = route.params as { activityId: string };
    const id = Number(activityId);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [activityQuery, coordinatesQuery] = useQueries({
        queries: [
            {
                queryKey: ["activity", id],
                queryFn: () => activityService.getById(id),
                enabled: !!id,
            },
            {
                queryKey: ["coordinates", id],
                queryFn: () => activityService.getCoordinatesByActivityId(id),
                enabled: !!id,
            },
        ],
    });

    const activity = activityQuery.data ?? null;
    const coordinates = coordinatesQuery.data ?? [];

    const kmSplits = useMemo(
        () => (coordinates.length > 0 ? computeKmSplits(coordinates) : []),
        [coordinates],
    );

    const isLoading = activityQuery.isLoading || coordinatesQuery.isLoading;
    const isError = activityQuery.isError || coordinatesQuery.isError;

    const refresh = () => {
        setIsRefreshing(true);
        Promise.all([
            activityQuery.refetch(),
            coordinatesQuery.refetch(),
        ]).finally(() => setIsRefreshing(false));
    };

    return (
        <SafeScreen>
            <ScrollView
                contentContainerStyle={{ flexGrow: 1 }}
                stickyHeaderIndices={[0]}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefreshing}
                        onRefresh={refresh}
                    />
                }
            >
                <ActivityDetailsHeader activity={activity} />
                {isLoading ? (
                    <View className="flex-1 items-center justify-center py-20">
                        <ActivityIndicator size="large" />
                    </View>
                ) : activity && coordinates.length > 0 ? (
                    <ColView className="relative flex-1 gap-4 pt-4">
                        <ActivitySummary activity={activity} />
                        <ActivityDetailsMap
                            kmSplits={kmSplits}
                            coordinates={coordinates}
                        />
                        <ActivityDetailsSplits
                            activity={activity}
                            kmSplits={kmSplits}
                        />
                    </ColView>
                ) : (
                    <ActivityDetailsEmptyState />
                )}
            </ScrollView>
        </SafeScreen>
    );
}
