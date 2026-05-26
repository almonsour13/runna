import { ColView } from "@/shared/components/CustomView";
import SafeScreen from "@/shared/components/SafeScreen";
import { activityService } from "@/shared/services/storage/activity.service";
import { Coordinate } from "@/shared/types/type";
import { computeKmSplits } from "@/shared/utils/compute";
import { useRoute } from "@react-navigation/native";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import {
    ActivityIndicator,
    RefreshControl,
    ScrollView,
    View,
} from "react-native";
import ActivityDetailsEmptyState from "./Components/ActivityDetailsEmptyState";
import ActivityDetailsHeader from "./Components/ActivityDetailsHeader";
import ActivityDetailsMap from "./Components/ActivityDetailsMap";
import ActivitySummary from "./Components/ActivityDetailsSummary";

export type KmSplits = {
    km: number;
    durationSec: number;
    paceMinkm: number;
    coord: Coordinate;
}[];

export default function ActivityDetailsScreen() {
    const route = useRoute();
    const { activityId } = route.params as { activityId: string };
    const id = activityId;
    const [isRefreshing, setIsRefreshing] = useState(false);

    const {
        data: activity,
        isLoading,
        refetch,
    } = useQuery({
        queryKey: ["activity", id],
        queryFn: async () => activityService.getById(id),
        enabled: !!id,
    });

    const coordinates = activity?.coordinates || [];

    const kmSplits = useMemo(
        () => (coordinates.length > 0 ? computeKmSplits(coordinates) : []),
        [coordinates],
    );

    const refresh = () => {
        setIsRefreshing(true);
        refetch().finally(() => setIsRefreshing(false));
    };

    return (
        <SafeScreen className="">
            <ScrollView
                contentContainerStyle={{ flexGrow: 1 }}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefreshing}
                        onRefresh={refresh}
                    />
                }
            >
                {isLoading ? (
                    <View className="flex-1 items-center justify-center py-20">
                        <ActivityIndicator size="large" />
                    </View>
                ) : activity && coordinates.length > 0 ? (
                    <ColView className="relative flex-1 gap-0">
                        <ActivityDetailsHeader activity={activity} />
                        <ActivityDetailsMap
                            kmSplits={kmSplits}
                            coordinates={coordinates}
                        />
                        <ActivitySummary activity={activity} />
                    </ColView>
                ) : (
                    <ActivityDetailsEmptyState />
                )}
            </ScrollView>
        </SafeScreen>
    );
}
