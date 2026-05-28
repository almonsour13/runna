import { ColView, RowView } from "@/shared/components/CustomView";
import Card from "@/shared/components/ui/Card";
import Icon from "@/shared/components/ui/Icon";
import Text from "@/shared/components/ui/Text";
import { convertMsToS, convertMtoKm } from "@/shared/utils/convert";
import { formatDuration, formatPace } from "@/shared/utils/format";
import { format } from "date-fns";
import { useMemo } from "react";
import { useStatisticContext } from "../context/StatisticContext";

export default function StatisticPersonalBests() {
    const { activities, isLoading } = useStatisticContext();

    const { bestDistance, bestDuration, bestCalories, bestPace } =
        useMemo(() => {
            // ✅ Guard — return nulls if no activities
            if (!activities.length)
                return {
                    bestDistance: null,
                    bestDuration: null,
                    bestCalories: null,
                    bestPace: null,
                };

            const bestDistance = activities.reduce((a, b) =>
                a.distance > b.distance ? a : b,
            );
            const bestDuration = activities.reduce((a, b) =>
                a.duration > b.duration ? a : b,
            );
            const bestCalories = activities.reduce((a, b) =>
                a.calories > b.calories ? a : b,
            );
            const bestPace =
                activities
                    .filter((a) => (a.avgPace ?? 0) > 0)
                    .reduce(
                        (a, b) => (a.avgPace < b.avgPace ? a : b),
                        activities[0],
                    ) ?? null;

            return { bestDistance, bestDuration, bestCalories, bestPace };
        }, [activities]);
    if (!isLoading && (!bestDistance || !bestDuration || !bestCalories))
        return null;

    const stats = [
        {
            label: "Longest Distance",
            value: `${convertMtoKm(bestDistance?.distance ?? 0).toFixed(1)}`,
            date: bestDistance?.createdAt ?? null,
            icon: "navigate",
            unit: "km",
        },
        {
            label: "Longest Duration",
            value: formatDuration(convertMsToS(bestDuration?.duration ?? 0)),
            date: bestDuration?.createdAt ?? null,
            icon: "time",
            unit: null,
        },
        {
            label: "Most Calories",
            value: `${(bestCalories?.calories ?? 0).toFixed(0)}`,
            date: bestCalories?.createdAt ?? null,
            icon: "flame",
            unit: "kcal",
        },
        {
            label: "Best Pace",
            value: formatPace(bestPace?.avgPace ?? 0),
            date: bestPace?.createdAt ?? null,
            icon: "timer",
        },
    ];

    return (
        <ColView className="px-4 gap-1">
            <Text className="text-lg font-medium">Personal Bests</Text>
            <ColView className="gap-2">
                {stats.map((stat) => (
                    <Card key={stat.label} className="flex-1">
                        {isLoading ? (
                            <Card className="flex-1 h-12" />
                        ) : (
                            <RowView className="justify-between">
                                <ColView>
                                    <RowView className="gap-2 items-center">
                                        <Icon
                                            name={stat.icon}
                                            size={12}
                                            className="text-primary"
                                        />
                                        <Text className="text-sm text-muted-foreground">
                                            {stat.label}
                                        </Text>
                                    </RowView>
                                    <RowView className="gap-2 items-center">
                                        <Icon
                                            name="calendar"
                                            size={10}
                                            className="text-primary"
                                        />
                                        <Text className="text-xs text-muted-foreground">
                                            {stat.date
                                                ? format(
                                                      new Date(stat.date),
                                                      "MMM d, yyyy",
                                                  )
                                                : "—"}
                                        </Text>
                                    </RowView>
                                </ColView>
                                <RowView
                                    style={{
                                        alignItems: "baseline",
                                        gap: 2,
                                        flexShrink: 0,
                                    }}
                                >
                                    <Text className="text-2xl font-medium">
                                        {stat.value}
                                    </Text>
                                    {stat.unit && (
                                        <Text className="text-xs text-muted-foreground">
                                            {stat.unit}
                                        </Text>
                                    )}
                                </RowView>
                            </RowView>
                        )}
                    </Card>
                ))}
            </ColView>
        </ColView>
    );
}
