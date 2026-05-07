import { ColView, RowView } from "@/shared/components/CustomView";
import Card from "@/shared/components/ui/Card";
import Text from "@/shared/components/ui/Text";
import { format, isToday, isYesterday } from "date-fns";
import { View } from "react-native";
import { Activity } from "../types/type";
import { computeTotalDistance, convertMtoKm } from "../utils/distance";
import { capitalize } from "../utils/utils";
import RouteMap from "./RouteMap";

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
export default function ActivityCard({ activity }: { activity: Activity }) {
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

    const distanceKm = convertMtoKm(computeTotalDistance(activity.coordinates));
    const goalKm = convertMtoKm(activity.goal);
    const pct = (Number(distanceKm) / Number(goalKm)) * 100 || 0;
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
                            className="text-xs fotn-medium"
                            style={{
                                color: config.color,
                            }}
                        >
                            {capitalize(activity.type)}
                        </Text>
                    </RowView>
                    <RowView className="justify-between items-end">
                        <Text className="text-2xl font-medium">
                            {distanceKm}{" "}
                            <Text className="text-sm text-muted-foreground">
                                / {goalKm} km
                            </Text>
                        </Text>
                        <Text className="text-sm text-primary font-medium">
                            {pct.toFixed(0)}%
                        </Text>
                    </RowView>
                    <ColView>
                        <View className="bg-muted w-full h-1 rounded-full overflow-hidden">
                            <View
                                className="h-1 bg-primary"
                                style={{
                                    width: `${pct}%`,
                                }}
                            />
                        </View>
                    </ColView>
                </ColView>
            </RowView>
        </Card>
    );
}
