import { ColView, RowView } from "@/shared/components/CustomView";
import Icon from "@/shared/components/Icon";
import Card from "@/shared/components/ui/Card";
import Text from "@/shared/components/ui/Text";
import { cn } from "@/shared/utils/cn";
import { eachDayOfInterval, isToday, startOfDay, subDays } from "date-fns";
import { useMemo } from "react";
import { View } from "react-native";
import { useStatisticContext } from "../context/StatisticContext";

const DAYS_SHOWN = 35; // 5 weeks

export default function StatisticStreak() {
    const { activities } = useStatisticContext();

    const { heatmap, currentStreak, longestStreak } = useMemo(() => {
        const end = startOfDay(new Date());
        const start = subDays(end, DAYS_SHOWN - 1);
        const activeDays = new Set(
            activities.map((a) =>
                startOfDay(new Date(a.createdAt)).toDateString(),
            ),
        );

        const days = eachDayOfInterval({ start, end }).map((date) => ({
            date,
            active: activeDays.has(date.toDateString()),
            isToday: isToday(date),
        }));

        // current streak
        let current = 0;
        for (let i = days.length - 1; i >= 0; i--) {
            if (days[i].active) current++;
            else break;
        }

        // longest streak
        let longest = 0;
        let run = 0;
        days.forEach((d) => {
            if (d.active) {
                run++;
                longest = Math.max(longest, run);
            } else run = 0;
        });

        return {
            heatmap: days,
            currentStreak: current,
            longestStreak: longest,
        };
    }, [activities]);

    const weeks = useMemo(() => {
        const chunks: (typeof heatmap)[] = [];
        for (let i = 0; i < heatmap.length; i += 7)
            chunks.push(heatmap.slice(i, i + 7));
        return chunks;
    }, [heatmap]);

    const DAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

    return (
        <ColView className="px-4 gap-1">
            <Text className="text-lg font-medium">Activity Streak</Text>
            <Card className="gap-3">
                {/* Streak stats */}
                <RowView className="gap-1">
                    <Card className="flex-1 items-center gap-1 bg-primary/10 border-0">
                        <RowView className="gap-1 items-center">
                            <Icon name="flame" size={14} color="#f59e0b" />
                            <Text className="text-xs text-muted-foreground">
                                Current
                            </Text>
                        </RowView>
                        <Text className="text-2xl font-bold">
                            {currentStreak}
                        </Text>
                        <Text className="text-xs text-muted-foreground">
                            days
                        </Text>
                    </Card>
                    <Card className="flex-1 items-center gap-1 bg-muted/50 border-0">
                        <RowView className="gap-1 items-center">
                            <Icon name="trophy" size={14} color="#8b5cf6" />
                            <Text className="text-xs text-muted-foreground">
                                Longest
                            </Text>
                        </RowView>
                        <Text className="text-2xl font-bold">
                            {longestStreak}
                        </Text>
                        <Text className="text-xs text-muted-foreground">
                            days
                        </Text>
                    </Card>
                </RowView>

                {/* Day labels */}
                <RowView className="gap-1 px-0">
                    {DAY_LABELS.map((d, i) => (
                        <View key={i} className="flex-1 items-center">
                            <Text className="text-xs text-muted-foreground">
                                {d}
                            </Text>
                        </View>
                    ))}
                </RowView>

                {/* Heatmap grid */}
                <ColView className="gap-1">
                    {weeks.map((week, wi) => (
                        <RowView key={wi} className="gap-1">
                            {week.map((day, di) => (
                                <View
                                    key={di}
                                    className={cn(
                                        "flex-1 aspect-square rounded-sm",
                                        day.active
                                            ? day.isToday
                                                ? "bg-primary"
                                                : "bg-primary/50"
                                            : "bg-muted/50",
                                        day.isToday &&
                                            !day.active &&
                                            "border border-primary",
                                    )}
                                />
                            ))}
                        </RowView>
                    ))}
                </ColView>

                {/* Legend */}
                <RowView className="gap-2 justify-end items-center">
                    <Text className="text-xs text-muted-foreground">Less</Text>
                    {[
                        "bg-muted/50",
                        "bg-primary/20",
                        "bg-primary/50",
                        "bg-primary",
                    ].map((c, i) => (
                        <View key={i} className={cn("w-3 h-3 rounded-sm", c)} />
                    ))}
                    <Text className="text-xs text-muted-foreground">More</Text>
                </RowView>
            </Card>
        </ColView>
    );
}
