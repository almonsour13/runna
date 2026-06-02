import { ColView, RowView } from "@/shared/components/CustomView";
import Text from "@/shared/components/ui/Text";
import { Coordinate } from "@/shared/types/type";
import {
    ActivityIndicator,
    RefreshControl,
    ScrollView,
    View,
} from "react-native";
import ActivityDetailsEmptyState from "../components/ActivityDetailsEmptyState";
import ActivityDetailsHeader from "../components/ActivityDetailsHeader";
import ActivityDetailsMap from "../components/ActivityDetailsMap";
import ActivitySummary from "../components/ActivityDetailsSummary";
import { useActivityDetailsContext } from "../context/ActivityDetailsContext";

export type KmSplits = {
    km: number;
    durationSec: number;
    paceMinkm: number;
    coord: Coordinate;
}[];

export default function ActivityDetailsScreen() {
    const { activity, coordinates, isLoading, isRefreshing, refetch } =
        useActivityDetailsContext();
    return (
        <ScrollView
            contentContainerStyle={{ flexGrow: 1 }}
            refreshControl={
                <RefreshControl refreshing={isRefreshing} onRefresh={refetch} />
            }
        >
            {isLoading ? (
                <View className="flex-1 items-center justify-center py-20">
                    <ActivityIndicator size="large" />
                </View>
            ) : activity && coordinates.length > 0 ? (
                <ColView className="relative flex-1 gap-0">
                    <ActivityDetailsHeader />
                    <ActivityDetailsMap />
                    <ActivitySummary />
                    <ColView className="hidden">
                        <RowView className="px-4">
                            <Text className="text-base">Media</Text>
                        </RowView>
                    </ColView>
                </ColView>
            ) : (
                <ActivityDetailsEmptyState />
            )}
        </ScrollView>
    );
}
