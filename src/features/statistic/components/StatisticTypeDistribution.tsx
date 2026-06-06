import { ColView, RowView } from "@/shared/components/CustomView";
import Card from "@/shared/components/ui/Card";
import Text from "@/shared/components/ui/Text";
import { ACTIVITY_TYPE_COLOR } from "@/shared/constant/constant";
import { ActivityType } from "@/shared/types/type";
import { useMemo } from "react";
import { View } from "react-native";
import { useStatisticContext } from "../context/StatisticContext";

export default function StatisticTypeDistribution() {
    const { activities, isLoading } = useStatisticContext();

    const breakdown = useMemo(() => {
        const map = new Map<string, number>();
        activities.forEach((a) => map.set(a.type, (map.get(a.type) ?? 0) + 1));
        const total = activities.length || 1;
        return Array.from(map.entries())
            .map(([type, count], i) => ({
                type,
                count,
                pct: (count / total) * 100,
                color: ACTIVITY_TYPE_COLOR[type as ActivityType],
            }))
            .sort((a, b) => b.count - a.count);
    }, [activities]);

    const segments = useMemo(
        () =>
            breakdown.map(({ type, count, color }) => ({
                label: type,
                value: count,
                color,
            })),
        [breakdown],
    );

    const total = activities.length;

    if (!breakdown.length) return null;

    return (
        <ColView className="px-4 gap-1">
            <Text className="text-lg font-medium">
                Activity Types Distribution
            </Text>
            {isLoading ? (
                <Card className="h-28" />
            ) : (
                <Card>
                    <ColView className="gap-2">
                        <RowView className="justify-between items-center">
                            <Text className="text-base font-medium text-muted-foreground">
                                Total
                            </Text>
                            <Text className="">{total}</Text>
                        </RowView>
                        <RowView className="gap-1 h-2 w-full rounded-full overflow-hidden">
                            {breakdown.map(({ type, count, pct, color }) => (
                                <View
                                    key={type}
                                    className="h-2 rounded-full"
                                    style={{
                                        backgroundColor: color,
                                        width: `${pct}%`,
                                    }}
                                />
                            ))}
                        </RowView>
                        <RowView className="flex-wrap gap-4  items-start">
                            {breakdown.map(({ type, count, pct, color }) => (
                                <RowView
                                    key={type}
                                    className="justify-between items-center"
                                >
                                    <RowView className="gap-2 items-center">
                                        <View
                                            style={{
                                                width: 8,
                                                height: 8,
                                                borderRadius: 2,
                                                backgroundColor: color,
                                            }}
                                        />
                                        <Text className="text-sm capitalize">
                                            {type}
                                        </Text>
                                    </RowView>
                                    <Text className="text-xs text-muted-foreground">
                                        {count} · {pct.toFixed(0)}%
                                    </Text>
                                </RowView>
                            ))}
                        </RowView>
                    </ColView>
                </Card>
            )}
        </ColView>
    );
}
