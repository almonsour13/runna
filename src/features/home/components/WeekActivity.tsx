import { ColView, RowView } from "@/shared/components/CustomView";
import Card from "@/shared/components/ui/Card";
import Text from "@/shared/components/ui/Text";
import { useActivityStore } from "@/shared/stores/use-activity.store";
import { computeTotalDistance } from "@/shared/utils/compute";
import { convertMtoKm } from "@/shared/utils/convert";
import clsx from "clsx";
import { addDays, format, isSameDay, startOfWeek } from "date-fns";
import { memo, useMemo } from "react";
import { TouchableOpacity, View } from "react-native";

function WeekActivity() {
    const isLoading = useActivityStore((s) => s.isLoading);
    const activities = useActivityStore((s) => s.activities);

    const today = useMemo(() => new Date(), []);

    const {
        weekActivity,
        distanceKm,
        goalKm,
        totalPct,
        streak,
        motivation,
        hasActivity,
    } = useMemo(() => {
        const map = new Map<string, typeof activities>();
        activities.forEach((a) => {
            const key = new Date(a.createdAt).toDateString();
            if (!map.has(key)) map.set(key, []);
            map.get(key)!.push(a);
        });

        const start = startOfWeek(today, { weekStartsOn: 0 });

        const weekActivity = Array.from({ length: 7 }).map((_, i) => {
            const date = addDays(start, i);
            const key = date.toDateString();
            const dayActivities = map.get(key) ?? [];

            const distance = dayActivities.reduce(
                (acc, activity) =>
                    acc + computeTotalDistance(activity.coordinates),
                0,
            );
            const goal = dayActivities.reduce(
                (acc, activity) => acc + activity.goal,
                0,
            );
            const pct = goal > 0 ? Math.min((distance / goal) * 100, 100) : 0;

            return {
                date,
                label: format(date, "EEE"),
                dayNumber: format(date, "d"),
                distance,
                goal,
                pct,
                isToday: isSameDay(date, today),
                isFuture: date > today,
            };
        });

        const hasActivity = weekActivity.some(
            (d) => !d.isFuture && d.distance > 0,
        );

        const distanceKm = convertMtoKm(
            weekActivity
                .filter((d) => !d.isFuture)
                .reduce((a, b) => a + b.distance, 0),
        );
        const goalKm = convertMtoKm(
            weekActivity
                .filter((d) => !d.isFuture)
                .reduce((a, b) => a + b.goal, 0),
        );

        const totalPct = goalKm > 0 ? (distanceKm / goalKm) * 100 : 0;

        const streak = (() => {
            let count = 0;
            for (let i = weekActivity.length - 1; i >= 0; i--) {
                if (weekActivity[i].isFuture) continue;
                if (weekActivity[i].pct >= 100) count++;
                else break;
            }
            return count;
        })();

        const motivation = (() => {
            if (!hasActivity)
                return {
                    emoji: "✨",
                    text: "No activity this week yet — start today!",
                };
            if (totalPct >= 90)
                return { emoji: "🔥", text: "On fire this week!" };
            if (totalPct >= 70)
                return { emoji: "💪", text: "Strong week, keep it up!" };
            if (totalPct >= 50)
                return { emoji: "👟", text: "Halfway there, push on!" };
            if (totalPct >= 25)
                return { emoji: "🚶", text: "Every step counts!" };
            return { emoji: "✨", text: "Let's get moving!" };
        })();

        return {
            weekActivity,
            distanceKm,
            goalKm,
            totalPct,
            streak,
            motivation,
            hasActivity,
        };
    }, [activities, today]);

    return (
        <View className="px-4">
            {isLoading ? (
                <Card className="h-60" />
            ) : (
                <Card className="">
                    <ColView className="gap-4">
                        <ColView className="gap-2">
                            <RowView className="justify-between">
                                <Text className="text-sm uppercase text-muted-foreground">
                                    This Week
                                </Text>
                                <RowView className="gap-2 items-center">
                                    {streak > 0 && (
                                        <View className="hidden px-2 py-0.5 rounded-full bg-muted">
                                            <Text className="text-xs text-white">
                                                🔥 {streak} day streak
                                            </Text>
                                        </View>
                                    )}
                                    {weekActivity.length === 7 && (
                                        <Text className="text-sm text-muted-foreground">
                                            {format(
                                                weekActivity[0].date,
                                                "MMM d",
                                            )}{" "}
                                            –{" "}
                                            {format(
                                                weekActivity[6].date,
                                                "MMM d",
                                            )}
                                        </Text>
                                    )}
                                </RowView>
                            </RowView>
                            <RowView className="items-baseline gap-1.5">
                                <Text className="text-5xl leading-none font-medium text-foreground">
                                    {distanceKm.toFixed(1).toLocaleString()}{" "}
                                    <Text className="text-muted-foreground text-base">
                                        km
                                    </Text>
                                </Text>
                            </RowView>
                        </ColView>

                        <RowView className="items-end gap-1">
                            {weekActivity.map((day, i) => (
                                <TouchableOpacity
                                    key={i}
                                    disabled={day.isFuture}
                                    className="flex-1 items-center gap-1"
                                >
                                    <Card className="light h-16 w-full justify-end bg-foreground/16 rounded overflow-hidden p-0 border-0">
                                        {!day.isFuture && (
                                            <View
                                                style={{
                                                    height: `${day.pct}%`,
                                                }}
                                                className={clsx(
                                                    "rounded",
                                                    day.isToday
                                                        ? "bg-primary"
                                                        : "bg-primary/20",
                                                )}
                                            />
                                        )}
                                    </Card>
                                    <Text
                                        className={`text-xs ${
                                            day.isToday
                                                ? "text-foreground font-bold"
                                                : "text-muted-foreground"
                                        }`}
                                    >
                                        {day.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </RowView>

                        <ColView className="gap-2">
                            <View className="h-1 w-full bg-foreground/16 rounded overflow-hidden">
                                <View
                                    style={{ width: `${totalPct}%` }}
                                    className="h-1 bg-primary rounded"
                                />
                            </View>
                            <RowView className="justify-between">
                                <Text className="text-sm text-muted-foreground">
                                    {motivation.text}
                                </Text>
                                {hasActivity && (
                                    <Text className="text-sm text-foreground font-medium">
                                        {totalPct.toFixed(0)}%
                                    </Text>
                                )}
                            </RowView>
                        </ColView>
                    </ColView>
                </Card>
            )}
        </View>
    );
}

export default memo(WeekActivity);
