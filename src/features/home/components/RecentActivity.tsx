import { ColView, RowView } from "@/shared/components/CustomView";
import RouteMap from "@/shared/components/RouteMap";
import Card from "@/shared/components/ui/Card";
import Text from "@/shared/components/ui/Text";
import { useActivityStore } from "@/shared/stores/use-activity.store";
import { computeTotalDistance, convertMtoKm } from "@/shared/utils/distance";
import { capitalize } from "@/shared/utils/utils";
import { format, isToday, isYesterday } from "date-fns";
import { useMemo } from "react";
import { View } from "react-native";

const TYPE_CONFIG = {
    run: {
        label: "Run",
        color: "#185FA5",
        bg: "#E6F1FB",
    },
    walk: {
        label: "Walk",
        color: "#0F6E56",
        bg: "#E1F5EE",
    },
} as const;

export default function RecentActivities() {
    const activities = useActivityStore((s) => s.activities);

    const recentActivities = useMemo(() => {
        return activities.slice(0, 5);
    }, [activities]);

    return (
        <ColView>
            <RowView className="px-4 justify-between">
                <Text className="text-lg">Recent Activities</Text>
                <Text className="text-lg text-primary">See All</Text>
            </RowView>
            <ColView className="px-4 gap-1">
                {recentActivities.map((activity) => {
                    const config = TYPE_CONFIG[activity.type];
                    const date = isToday(activity.startTime)
                        ? "Today"
                        : isYesterday(activity.startTime)
                          ? "Yesterday"
                          : format(activity.startTime, "MMM d");

                    const timeRange = [
                        date,
                        format(activity.startTime, "p"),
                        format(activity.endTime, "p"),
                    ].join(" - ");

                    const distanceKm = convertMtoKm(
                        computeTotalDistance(activity.coordinates),
                    );
                    const goalKm = convertMtoKm(activity.goal);
                    const pct =
                        (Number(distanceKm) / Number(goalKm)) * 100 || 0;
                    return (
                        <Card key={activity.id}>
                            <RowView className="gap-4 ">
                                <View className="h-16 aspect-square justify-center items-center rounded">
                                    <RouteMap
                                        coordinates={activity.coordinates}
                                        type={activity.type}
                                        size={128}
                                        color={TYPE_CONFIG[activity.type].color}
                                    />
                                </View>
                                <ColView className="flex-1">
                                    <RowView className="justify-between items-center">
                                        <Text className="text-xs text-muted-foreground">
                                            {timeRange}
                                        </Text>
                                        <Text
                                            className="text-xs"
                                            style={{
                                                color: config.color,
                                            }}
                                        >
                                            {capitalize(activity.type)}
                                        </Text>
                                    </RowView>
                                    <RowView className="justify-between items-end">
                                        <Text className="text-2xl">
                                            {distanceKm}{" "}
                                            <Text className="text-sm text-muted-foreground">
                                                / {goalKm} km
                                            </Text>
                                        </Text>
                                        <Text
                                            className="text-sm"
                                            style={{
                                                color: config.color,
                                            }}
                                        >
                                            {pct.toFixed(0)}%
                                        </Text>
                                    </RowView>
                                    <ColView>
                                        <View className="bg-muted w-full h-1 rounded-full overflow-hidden">
                                            <View
                                                className="h-1"
                                                style={{
                                                    width: `${pct}%`,
                                                    backgroundColor:
                                                        config.color,
                                                }}
                                            />
                                        </View>
                                    </ColView>
                                </ColView>
                            </RowView>
                        </Card>
                    );
                })}
            </ColView>
        </ColView>
    );
}
