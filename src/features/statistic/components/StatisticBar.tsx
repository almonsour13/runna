import { ColView, RowView } from "@/shared/components/CustomView";
import Card from "@/shared/components/ui/Card";
import Text from "@/shared/components/ui/Text";
import { cn } from "@/shared/utils/cn";
import { convertMtoKm } from "@/shared/utils/convert";
import { eachDayOfInterval, isToday } from "date-fns";
import { useMemo } from "react";
import { View } from "react-native";
import { useStatisticContext } from "../context/StatisticContext";

const BAR_HEIGHT = 180;

export default function StatisticBar() {
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
            byDay.set(key, (byDay.get(key) ?? 0) + (a.distance ?? 0));
        });
        return days.map((date) => ({
            date,
            distance: byDay.get(date.toDateString()) ?? 0,
            isToday: isToday(date),
            isFuture: date > new Date(),
        }));
    }, [activeTab, activities, dateRange]);

    const maxDistance = useMemo(() => {
        return Math.max(...barData.map((d) => d.distance), 0);
    }, [barData]);

    const ruler = useMemo(() => {
        const steps = 4;
        const stepValue = maxDistance / steps;
        return Array.from(
            { length: steps + 1 },
            (_, i) => (steps - i) * stepValue,
        );
    }, [maxDistance]);

    return (
        <ColView className="px-4 gap-1">
            <Card>
                <RowView className="gap-4">
                    <View
                        style={{ height: BAR_HEIGHT }}
                        className="justify-between"
                    >
                        {ruler.map((r, i) => (
                            <Text
                                key={i}
                                className="text-xs text-foreground leading-none"
                            >
                                {convertMtoKm(r).toFixed(0)}{" "}
                                <Text className="text-[8px] text-muted-foreground">
                                    km
                                </Text>
                            </Text>
                        ))}
                    </View>

                    <RowView
                        className="flex-1 gap-1"
                        style={{ height: BAR_HEIGHT }}
                    >
                        {barData.map((d, idx) => {
                            const pct =
                                maxDistance > 0
                                    ? (d.distance / maxDistance) * 100
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
                                                    ? "bg-primary"
                                                    : "bg-primary/20",
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
