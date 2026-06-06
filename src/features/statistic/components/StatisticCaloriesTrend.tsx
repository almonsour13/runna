import { ColView, RowView } from "@/shared/components/CustomView";
import Card from "@/shared/components/ui/Card";
import Text from "@/shared/components/ui/Text";
import { cn } from "@/shared/utils/cn";
import { formatCalories } from "@/shared/utils/format";
import {
    eachDayOfInterval,
    eachMonthOfInterval,
    format,
    isThisMonth,
    isToday,
} from "date-fns";
import { useMemo } from "react";
import { View } from "react-native";
import { useStatisticContext } from "../context/StatisticContext";

const BAR_HEIGHT = 128;
const DAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

export default function StatisticCaloriesTrend() {
    const { activeTab, activities, dateRange } = useStatisticContext();

    if (activeTab === "All Time") return null;

    const barData = useMemo(() => {
        if (!dateRange.from || !dateRange.to) return [];

        if (activeTab === "Year") {
            const months = eachMonthOfInterval({
                start: dateRange.from,
                end: dateRange.to,
            });
            const byMonth = new Map<string, number>();
            activities.forEach((a) => {
                const key = format(new Date(a.createdAt), "yyyy-MM");
                byMonth.set(key, (byMonth.get(key) ?? 0) + (a.calories ?? 0));
            });
            return months.map((date) => ({
                date,
                calories: byMonth.get(format(date, "yyyy-MM")) ?? 0,
                isToday: isThisMonth(date),
                isFuture: date > new Date(),
            }));
        }

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
    }, [activeTab, activities, dateRange]);

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
        () => formatCalories(barData.reduce((s, d) => s + d.calories, 0)),
        [barData],
    );

    const getBarLabel = (idx: number, date: Date): string | false => {
        if (activeTab === "Week") return DAY_LABELS[idx % 7];
        if (activeTab === "Year") return format(date, "MMM")[0];
        return false;
    };

    return (
        <ColView className="px-4">
            <Card>
                <ColView>
                    <RowView className="justify-between items-center">
                        <Text className="text-lg font-medium">
                            Calories Burned Trends
                        </Text>
                    </RowView>
                    <ColView className="gap-0.5">
                        <Text className="text-2xl font-medium">
                            {total} kcal
                        </Text>
                        <Text className="text-xs text-muted-foreground">
                            Total Calories Burned
                        </Text>
                    </ColView>
                    <RowView className="gap-2">
                        <View
                            style={{ height: BAR_HEIGHT }}
                            className="justify-between"
                        >
                            {ruler.map((r, i) => (
                                <Text key={i} className="text-xs leading-none">
                                    {formatCalories(r)}
                                </Text>
                            ))}
                        </View>
                        <RowView className="flex-1 gap-1">
                            {barData.map((d, idx) => {
                                const pct =
                                    maxCalories > 0
                                        ? (d.calories / maxCalories) * 100
                                        : 0;
                                const barLabel = getBarLabel(idx, d.date);
                                return (
                                    <ColView key={idx} className="flex-1">
                                        <View
                                            className="justify-end bg-muted rounded overflow-hidden"
                                            style={{ height: BAR_HEIGHT }}
                                        >
                                            {!d.isFuture && (
                                                <View
                                                    style={{
                                                        height: `${pct}%`,
                                                    }}
                                                    className={cn(
                                                        "rounded",
                                                        d.isToday
                                                            ? "bg-amber-500"
                                                            : "bg-amber-500/30",
                                                    )}
                                                />
                                            )}
                                        </View>
                                        {barLabel && (
                                            <Text className="text-xs text-center">
                                                {barLabel}
                                            </Text>
                                        )}
                                    </ColView>
                                );
                            })}
                        </RowView>
                    </RowView>
                </ColView>
            </Card>
        </ColView>
    );
}
