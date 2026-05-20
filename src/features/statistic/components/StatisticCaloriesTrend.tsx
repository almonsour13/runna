import { ColView, RowView } from "@/shared/components/CustomView";
import Card from "@/shared/components/ui/Card";
import Text from "@/shared/components/ui/Text";
import { cn } from "@/shared/utils/cn";
import { eachDayOfInterval, isToday } from "date-fns";
import { useMemo } from "react";
import { View } from "react-native";
import { useStatisticContext } from "../context/StatisticContext";

const BAR_HEIGHT = 156;

export default function StatisticCaloriesTrend() {
    const { activeTab, activities, dateRange } = useStatisticContext();

    if (activeTab === "All Time") return null;

    const barData = useMemo(() => {
        if (!dateRange.from || !dateRange.to) return [];
        const days = eachDayOfInterval({
            start: dateRange.from,
            end: dateRange.to,
        });
        const byDay = new Map<string, number>();
        activities.forEach((a) => {
            const key = new Date(a.createdAt).toDateString();
            byDay.set(key, (byDay.get(key) ?? 0) + (a.calories ?? 0));
        });
        return days.map((date) => ({
            date,
            calories: byDay.get(date.toDateString()) ?? 0,
            isToday: isToday(date),
            isFuture: date > new Date(),
        }));
    }, [activities, dateRange]);

    const maxCalories = useMemo(
        () => Math.max(...barData.map((d) => d.calories), 0),
        [barData],
    );

    const ruler = useMemo(() => {
        const steps = 4;
        const stepValue = maxCalories / steps;
        return Array.from(
            { length: steps + 1 },
            (_, i) => (steps - i) * stepValue,
        );
    }, [maxCalories]);

    const total = useMemo(
        () => barData.reduce((s, d) => s + d.calories, 0),
        [barData],
    );

    return (
        <ColView className="px-4 gap-1">
            <RowView className="justify-between items-center">
                <Text className="text-lg font-medium text-foreground">
                    Calories Burned
                </Text>
                <Text className="text-xs text-muted-foreground">
                    {total.toFixed(0)} kcal total
                </Text>
            </RowView>
            <Card>
                <RowView className="gap-2">
                    <View
                        style={{ height: BAR_HEIGHT }}
                        className="justify-between"
                    >
                        {ruler.map((r, i) => (
                            <Text
                                key={i}
                                className="text-xs text-foreground leading-none"
                            >
                                {r.toFixed(0)}
                            </Text>
                        ))}
                    </View>
                    <RowView
                        className="flex-1 gap-1"
                        style={{ height: BAR_HEIGHT }}
                    >
                        {barData.map((d, idx) => {
                            const pct =
                                maxCalories > 0
                                    ? (d.calories / maxCalories) * 100
                                    : 0;
                            return (
                                <View
                                    key={idx}
                                    className="flex-1 justify-end bg-muted/50 rounded overflow-hidden"
                                    style={{ height: BAR_HEIGHT }}
                                >
                                    {!d.isFuture && (
                                        <View
                                            style={{ height: `${pct}%` }}
                                            className={cn(
                                                "rounded",
                                                d.isToday
                                                    ? "bg-amber-500"
                                                    : "bg-amber-500/30",
                                            )}
                                        />
                                    )}
                                </View>
                            );
                        })}
                    </RowView>
                </RowView>
            </Card>
        </ColView>
    );
}
