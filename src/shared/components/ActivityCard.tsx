import { ColView, RowView } from "@/shared/components/CustomView";
import Card from "@/shared/components/ui/Card";
import Text from "@/shared/components/ui/Text";
import { useNavigation } from "@react-navigation/native";
import { format, isToday, isYesterday } from "date-fns";
import { useRef } from "react";
import { TouchableOpacity, View } from "react-native";
import { ACTIVITY_TYPE_COLOR } from "../constant/constant";
import { useFormatMetrics } from "../hooks/use-format-metrics";
import {
    ActivityType,
    ActivityWithCoordinates,
    NavigationProp,
} from "../types/type";
import { cn } from "../utils/cn";
import { simplifyCoordinates } from "../utils/simplify-coordinates";
import ActivityActionDrawer, {
    ActivityActionDrawerHandle,
} from "./drawer/ActivityActionDrawer";
import Icon from "./ui/Icon";
import VectorRouteMap from "./VectorRouteMap";

export default function ActivityCard({
    activity,
    className,
    onPress,
}: {
    activity: ActivityWithCoordinates;
    className?: string;
    onPress?: () => void;
}) {
    const navigation = useNavigation<NavigationProp>();
    const activityActionDrawerRef = useRef<ActivityActionDrawerHandle>(null);
    const {
        id,
        startTime,
        endTime,
        distance,
        calories,
        duration,
        avgPace,
        avgSpeed,
        steps,
        goal,
        type,
        source,
        coordinates,
    } = activity;

    const date = isToday(activity.startTime)
        ? "Today"
        : isYesterday(activity.startTime)
          ? "Yesterday"
          : format(activity.startTime, "MMM d");

    const timeRange = [
        date,
        format(startTime, "p"),
        endTime ? format(endTime, "p") : "Ongoing",
    ].join(" • ");

    const pct = (distance / goal) * 100;

    const isGoalMet = pct >= 100;
    const simplifiedCoordinates = simplifyCoordinates(
        coordinates,
        0.0001,
        false,
    );

    const stats = useFormatMetrics({
        distance,
        duration,
        calories,
        steps,
    });

    const isImported = source === "import";

    return (
        <>
            <TouchableOpacity
                onPress={() => {
                    onPress?.();
                    navigation.navigate("ActivityDetails", { activityId: id });
                }}
                onLongPress={() => {
                    activityActionDrawerRef.current?.openWithActivityId(id);
                }}
            >
                <Card key={activity.id} className={cn("", className)}>
                    <RowView className="gap-4">
                        <View className="h-12 aspect-square justify-center items-center rounded">
                            {coordinates && (
                                <VectorRouteMap
                                    coordinates={coordinates}
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
                                <RowView>
                                    {isImported && (
                                        <Text className="capitalize text-xs font-medium text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                                            Imported
                                        </Text>
                                    )}
                                    <Text
                                        className="capitalize text-xs font-medium text-primary bg-muted px-1.5 py-0.5 rounded"
                                        style={{
                                            color: ACTIVITY_TYPE_COLOR[
                                                type as ActivityType
                                            ],
                                        }}
                                    >
                                        {type}
                                    </Text>
                                </RowView>
                            </RowView>
                            <RowView>
                                {stats.map((stat, i) => {
                                    return (
                                        <RowView
                                            key={stat.label}
                                            className="items-center gap-1"
                                        >
                                            <Icon
                                                name={stat.icon}
                                                size={12}
                                                className="text-primary"
                                            />
                                            {stat.value.map((v, i) => (
                                                <Text
                                                    key={i}
                                                    className={cn(
                                                        "text-sm font-medium",
                                                    )}
                                                >
                                                    {v.value}

                                                    {stat.label !==
                                                        "Duration" && " "}
                                                    <Text className="text-xs font-medium">
                                                        {v.unit}
                                                    </Text>
                                                </Text>
                                            ))}
                                        </RowView>
                                    );
                                })}
                                {/* <Text className="text-2xl font-medium">
                                    {distanceKm.toFixed(1)}{" "}
                                    <Text className="text-sm font-medium  text-muted-foreground">
                                        / {goalKm.toFixed(1)} km
                                    </Text>
                                </Text>
                                <Text className="text-sm font-medium">
                                    {pct.toFixed(0)}%
                                </Text> */}
                            </RowView>
                        </ColView>
                    </RowView>
                </Card>
            </TouchableOpacity>
            <ActivityActionDrawer
                ref={activityActionDrawerRef}
                onClose={() => {
                    onPress?.();
                }}
            />
        </>
    );
}
