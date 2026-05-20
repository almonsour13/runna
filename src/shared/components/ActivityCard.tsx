import { ColView, RowView } from "@/shared/components/CustomView";
import Card from "@/shared/components/ui/Card";
import Text from "@/shared/components/ui/Text";
import { useNavigation } from "@react-navigation/native";
import { useQuery } from "@tanstack/react-query";
import { format, isToday, isYesterday } from "date-fns";
import { useRef } from "react";
import { TouchableOpacity, View } from "react-native";
import { activityService } from "../services/storage/activity.service";
import { Activity, Coordinate, NavigationProp } from "../types/type";
import { cn } from "../utils/cn";
import { convertMtoKm } from "../utils/convert";
import { simplifyCoordinates } from "../utils/simplify-coordinates";
import { capitalize } from "../utils/utils";
import ActivityActionDrawer, {
    ActivityActionDrawerHandle,
} from "./drawer/ActivityActionDrawer";
import VectorRouteMap from "./VectorRouteMap";

export default function ActivityCard({
    activity,
    className,
}: {
    activity: Activity & {
        coordinates?: Coordinate[];
    };
    className?: string;
}) {
    const navigation = useNavigation<NavigationProp>();
    const activityActionDrawerRef = useRef<ActivityActionDrawerHandle>(null);

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

    const distance = activity.distance;
    const distanceKm = convertMtoKm(distance);
    const goal = activity.goal;
    const goalKm = convertMtoKm(goal);
    const pct = (distance / goal) * 100;

    const { data: coordinates, isLoading: isCoordinatesLoading } = useQuery({
        queryKey: ["coordinates", activity.id],
        queryFn: async () => {
            const data = await activityService.getCoordinatesByActivityId(
                activity.id,
            );
            const s = simplifyCoordinates(data, 0.0001, false);
            activity.coordinates = s;
            return s;
        },
    });

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
                            {coordinates && (
                                <VectorRouteMap
                                    coordinates={coordinates}
                                    type={activity.type}
                                    strokeWidth={2}
                                    size={120}
                                />
                            )}
                        </View>
                        <ColView className="flex-1 gap-1 justify-between">
                            <RowView className="justify-between items-center">
                                <Text className="text-xs text-muted-foreground">
                                    {timeRange}
                                </Text>
                                <RowView className="items-center gap-2">
                                    {activity.isImported && (
                                        <Text className="text-xs font-medium text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                                            Imported
                                        </Text>
                                    )}
                                    <Text className="text-xs font-medium text-primary">
                                        {capitalize(activity.type)}
                                    </Text>
                                </RowView>
                            </RowView>
                            <RowView className="justify-between items-end">
                                <Text className="text-2xl font-bold">
                                    {distanceKm.toFixed(1)}{" "}
                                    <Text className="text-sm font-medium  text-muted-foreground">
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
