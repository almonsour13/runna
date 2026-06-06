import { ColView, RowView } from "@/shared/components/CustomView";
import Text from "@/shared/components/ui/Text";
import { Coordinate } from "@/shared/types/type";
import { RefreshControl, ScrollView } from "react-native";
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
    const { isRefreshing, refetch } = useActivityDetailsContext();
    return (
        <ScrollView
            contentContainerStyle={{ flexGrow: 1 }}
            refreshControl={
                <RefreshControl refreshing={isRefreshing} onRefresh={refetch} />
            }
        >
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
        </ScrollView>
    );
}
