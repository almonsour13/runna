import { ColView, RowView } from "@/shared/components/CustomView";
import Card from "@/shared/components/ui/Card";
import Text from "@/shared/components/ui/Text";
import { Ionicons } from "@expo/vector-icons";
import { useMemo } from "react";
import { View } from "react-native";
import { useStatisticContext } from "../context/StatisticContext";

export default function StatisticTypeBreakdown() {
    const { activities } = useStatisticContext();

    const breakdown = useMemo(() => {
        const map = new Map<string, number>();
        activities.forEach((a) => map.set(a.type, (map.get(a.type) ?? 0) + 1));
        const total = activities.length || 1;
        return Array.from(map.entries())
            .map(([type, count]) => ({
                type,
                count,
                pct: (count / total) * 100,
            }))
            .sort((a, b) => b.count - a.count);
    }, [activities]);

    if (!breakdown.length) return null;

    return (
        <ColView className="px-4 gap-1">
            <Text className="text-lg font-medium text-foreground">
                Activity Types
            </Text>
            <Card>
                <ColView className="gap-3">
                    {breakdown.map(({ type, count, pct }) => {
                        return (
                            <ColView key={type} className="gap-1">
                                <RowView className="justify-between items-center">
                                    <RowView className="gap-2 items-center">
                                        <Ionicons
                                            name="stats-chart"
                                            size={14}
                                            className="text-primary"
                                        />
                                        <Text className="text-sm capitalize text-foreground">
                                            {type}
                                        </Text>
                                    </RowView>
                                    <Text className="text-xs text-muted-foreground">
                                        {count} · {pct.toFixed(0)}%
                                    </Text>
                                </RowView>
                                <View className="h-2 bg-muted rounded-full overflow-hidden">
                                    <View
                                        className="h-full rounded-full bg-primary"
                                        style={{ width: `${pct}%` }}
                                    />
                                </View>
                            </ColView>
                        );
                    })}
                </ColView>
            </Card>
        </ColView>
    );
}
