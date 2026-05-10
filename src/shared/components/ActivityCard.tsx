import { ColView, RowView } from "@/shared/components/CustomView";
import Card from "@/shared/components/ui/Card";
import Text from "@/shared/components/ui/Text";
import { useNavigation } from "@react-navigation/native";
import { format, isToday, isYesterday } from "date-fns";
import { useMemo, useRef } from "react";
import { TouchableOpacity, View } from "react-native";
import { Activity, NavigationProp } from "../types/type";
import { cn } from "../utils/cn";
import { computeTotalDistance } from "../utils/compute";
import { convertMtoKm } from "../utils/convert";
import { capitalize } from "../utils/utils";
import RouteMap from "./RouteMap";
import ActivityActionDrawer, {
    ActivityActionDrawerHandle,
} from "./drawer/ActivityActionDrawer";

export default function ActivityCard({
    activity,
    className,
}: {
    activity: Activity;
    className?: string;
}) {
    const navigation = useNavigation<NavigationProp>();
    const activityActionDrawerRef = useRef<ActivityActionDrawerHandle>(null);

    const { distanceKm, goalKm, pct, timeRange } = useMemo(() => {
        const distanceKm = convertMtoKm(
            computeTotalDistance(activity.coordinates),
        );
        const goalKm = convertMtoKm(activity.goal);
        const pct = goalKm > 0 ? (distanceKm / goalKm) * 100 : 0;
        const date = isToday(activity.startTime)
            ? "Today"
            : isYesterday(activity.startTime)
              ? "Yesterday"
              : format(activity.startTime, "MMM d");
        const timeRange = [
            date,
            format(activity.startTime, "p"),
            activity.endTime ? format(activity.endTime, "p") : "Ongoing",
        ].join(" • ");

        return { distanceKm, goalKm, pct, timeRange };
    }, [activity]);

    return (
        <>
            <TouchableOpacity
                onPress={() =>
                    navigation.navigate("ActivityDetails", {
                        activityId: activity.id,
                    })
                }
                onLongPress={() =>
                    activityActionDrawerRef.current?.openWithActivityId(
                        activity.id,
                    )
                }
            >
                <Card key={activity.id} className={cn("", className)}>
                    <RowView className="gap-4">
                        <View className="h-12 aspect-square justify-center items-center rounded">
                            <RouteMap
                                coordinates={activity.coordinates}
                                type={activity.type}
                                strokeWidth={2}
                                size={120}
                            />
                        </View>
                        <ColView className="flex-1 gap-1 justify-between">
                            <RowView className="justify-between items-center">
                                <Text className="text-xs text-muted-foreground">
                                    {timeRange}
                                </Text>
                                <Text className="text-xs font-medium text-primary">
                                    {capitalize(activity.type)}
                                </Text>
                            </RowView>
                            <RowView className="justify-between items-end">
                                <Text className="text-2xl font-medium">
                                    {distanceKm.toFixed(1)}{" "}
                                    <Text className="text-sm text-muted-foreground">
                                        / {goalKm.toFixed(1)} km
                                    </Text>
                                </Text>
                                <Text className="text-sm font-medium">
                                    {pct.toFixed(0)}%
                                </Text>
                            </RowView>
                        </ColView>
                    </RowView>
                </Card>
            </TouchableOpacity>
            <ActivityActionDrawer ref={activityActionDrawerRef} />
        </>
    );
}
