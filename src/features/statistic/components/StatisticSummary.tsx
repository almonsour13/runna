import { ColView, RowView } from "@/shared/components/CustomView";
import Card from "@/shared/components/ui/Card";
import Text from "@/shared/components/ui/Text";
import { cn } from "@/shared/utils/cn";
import { convertMsToS, convertMtoKm } from "@/shared/utils/convert";
import { formatCalories, formatDuration } from "@/shared/utils/format";
import { Ionicons } from "@expo/vector-icons";
import { useMemo } from "react";
import { useStatisticContext } from "../context/StatisticContext";

export default function StatisticSummary() {
    const { activities, isLoading } = useStatisticContext();

    const { distance, duration, calories, steps } = useMemo(() => {
        const distance = activities.reduce(
            (acc, activity) => acc + activity.distance,
            0,
        );
        const duration = activities.reduce(
            (acc, activity) => acc + activity.duration,
            0,
        );
        const calories = activities.reduce(
            (acc, activity) => acc + activity.calories,
            0,
        );
        const steps = 1212;

        return {
            distance,
            duration,
            calories,
            steps,
        };
    }, [activities]);
    const stats = [
        {
            label: "Distance",
            value: convertMtoKm(distance).toFixed(2),
            unit: "km",
            icon: "location",
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
            icon: "stats-chart" as const,
        },
    ];

    const row1 = stats.slice(0, 2);
    const row2 = stats.slice(2, 4);

    const StatCard = ({ stat }: { stat: (typeof stats)[0] }) => {
        return (
            <Card className="flex-1">
                {isLoading ? (
                    <ColView className="gap-1">
                        <RowView className="gap-1">
                            <Card className="flex-1 h-12" />
                        </RowView>
                    </ColView>
                ) : (
                    <ColView className="gap-1">
                        <RowView className="gap-1">
                            <Ionicons
                                name={stat.icon as any}
                                size={11}
                                className="text-primary"
                            />
                            <Text className="text-xs text-muted-foreground">
                                {stat.label}
                            </Text>
                        </RowView>
                        <Text className={cn("text-3xl font-bold")}>
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
        );
    };
    return (
        <ColView className="px-4 gap-1">
            <RowView className="gap-1">
                {row1.map((stat) => (
                    <StatCard stat={stat} />
                ))}
            </RowView>
            <RowView className="gap-1">
                {row2.map((stat) => (
                    <StatCard stat={stat} />
                ))}
            </RowView>
        </ColView>
    );
}
