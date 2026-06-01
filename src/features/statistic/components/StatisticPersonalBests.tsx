import { ColView, RowView } from "@/shared/components/CustomView";
import Card from "@/shared/components/ui/Card";
import Icon from "@/shared/components/ui/Icon";
import Text from "@/shared/components/ui/Text";
import { convertMsToS, convertMtoKm } from "@/shared/utils/convert";
import { formatDurationReadable, formatPace } from "@/shared/utils/format";
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

    const formattedDuration = formatDurationReadable(
        convertMsToS(bestDuration?.duration ?? 0),
    );
    const stats = [
        {
            key: "distance",
            label: "Longest Distance",
            value: [
                {
                    value: convertMtoKm(bestDistance?.distance ?? 0).toFixed(2),
                    unit: "km",
                },
            ],
            date: bestDistance?.createdAt ?? null,
            icon: "navigate",
        },
        {
            key: "duration",
            label: "Longest Duration",

            value: [
                {
                    value: formattedDuration.value[0].value,
                    unit: formattedDuration.value[0].unit,
                },
                {
                    value: formattedDuration.value[1].value,
                    unit: formattedDuration.value[1].unit,
                },
            ],
            date: bestDuration?.createdAt ?? null,
            icon: "time",
        },
        {
            key: "calories",
            label: "Most Calories",
            value: [
                {
                    value: `${(bestCalories?.calories ?? 0).toFixed(0)}`,
                    unit: "kcal",
                },
            ],
            date: bestCalories?.createdAt ?? null,
            icon: "flame",
        },
        {
            key: "pace",
            label: "Best Pace",
            value: [
                {
                    value: formatPace(bestPace?.avgPace ?? 0),
                    unit: "min/km",
                },
            ],
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
                                <RowView>
                                    {stat.value.map((v, i) => (
                                        <Text
                                            key={i}
                                            className="text-2xl font-medium leading-none"
                                        >
                                            {v.value}
                                            {stat.key !== "duration" && " "}
                                            <Text className="text-lg font-medium">
                                                {v.unit}
                                            </Text>
                                        </Text>
                                    ))}
                                </RowView>
                            </RowView>
                        )}
                    </Card>
                ))}
            </ColView>
        </ColView>
    );
}
