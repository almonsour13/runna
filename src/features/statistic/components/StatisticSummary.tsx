import { ColView, RowView } from "@/shared/components/CustomView";
import Card from "@/shared/components/ui/Card";
import Text from "@/shared/components/ui/Text";
import { convertMsToS, convertMtoKm } from "@/shared/utils/convert";
import { formatCalories, formatDuration } from "@/shared/utils/format";
import { Ionicons } from "@expo/vector-icons";
import { useMemo } from "react";
import { useStatisticContext } from "../context/StatisticContext";

export default function StatisticSummary() {
    const { activities, isLoading } = useStatisticContext();

    const { distance, duration, calories } = useMemo(
        () => ({
            distance: activities.reduce((acc, a) => acc + a.distance, 0),
            duration: activities.reduce((acc, a) => acc + a.duration, 0),
            calories: activities.reduce((acc, a) => acc + a.calories, 0),
        }),
        [activities],
    );

    const stats = useMemo(
        () => [
            {
                label: "Distance",
                value: convertMtoKm(distance).toFixed(2),
                unit: "km",
                icon: "navigate",
            },
            {
                label: "Duration",
                value: formatDuration(convertMsToS(duration)),
                unit: null,
                icon: "time",
            },
            {
                label: "Calories",
                value: formatCalories(calories),
                unit: "kcal",
                icon: "flame",
            },
            {
                label: "Total Activities",
                value: activities.length,
                unit: null,
                icon: "stats-chart",
            },
        ],
        [distance, duration, calories, activities.length],
    );
    return (
        <ColView className="px-4 gap-2">
            <Text className="text-lg font-medium text-foreground">Summary</Text>
            <ColView className="gap-1">
                <RowView className="gap-1 flex-wrap">
                    {stats.map((stat) => (
                        <Card
                            className="flex-1 min-w-[45%] gap-1"
                            key={stat.label}
                        >
                            {isLoading ? (
                                <ColView className="gap-1">
                                    <RowView className="gap-1">
                                        <Card className="flex-1 h-14" />
                                    </RowView>
                                </ColView>
                            ) : (
                                <ColView className="gap-1">
                                    <RowView className="gap-1 items-center">
                                        <Ionicons
                                            name={stat.icon as any}
                                            size={11}
                                            className="text-primary"
                                        />
                                        <Text className="text-xs text-muted-foreground">
                                            {stat.label}
                                        </Text>
                                    </RowView>
                                    <Text className="text-3xl font-bold">
                                        {stat.value}{" "}
                                        {stat.unit && (
                                            <Text className="text-xs font-normal text-muted-foreground">
                                                {stat.unit}
                                            </Text>
                                        )}
                                    </Text>
                                </ColView>
                            )}
                        </Card>
                    ))}
                </RowView>
            </ColView>
        </ColView>
    );
}
