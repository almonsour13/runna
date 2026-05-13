import { ColView, RowView } from "@/shared/components/CustomView";
import ActivityGroupDrawer, {
    ActivityGroupDrawerHandle,
} from "@/shared/components/drawer/ActivityGroupDrawer";
import Card from "@/shared/components/ui/Card";
import RingChart from "@/shared/components/ui/RingChart";
import Text from "@/shared/components/ui/Text";
import { useActivityStore } from "@/shared/stores/use-activity.store";
import { useProfileStore } from "@/shared/stores/use-profile.store";
import {
    computeCalories,
    computePace,
    computeTotalDistance,
} from "@/shared/utils/compute";
import { convertMsToS, convertMtoKm } from "@/shared/utils/convert";
import {
    formatCalories,
    formatDuration,
    formatPace,
} from "@/shared/utils/format";
import clsx from "clsx";
import { addDays, format, isSameDay, startOfWeek } from "date-fns";
import { memo, useMemo, useRef } from "react";
import { TouchableOpacity, View } from "react-native";

function WeekActivity() {
    const profile = useProfileStore((s) => s.profile);
    const isLoading = useActivityStore((s) => s.isLoading);
    const activities = useActivityStore((s) => s.activities);
    const activityGrouperDrawer = useRef<ActivityGroupDrawerHandle>(null);
    const today = useMemo(() => new Date(), []);

    const {
        weekDays,
        totalDistanceKm,
        totalDurationSec,
        totalGoalKm,
        averagePace,
        totalCalories,
        weeklyGoalPct,
        currentStreak,
        weeklyMotivation,
        hasWeeklyActivity,
    } = useMemo(() => {
        const activitiesByDate = new Map<string, typeof activities>();

        activities.forEach((activity) => {
            const dateKey = new Date(activity.createdAt).toDateString();

            if (!activitiesByDate.has(dateKey)) {
                activitiesByDate.set(dateKey, []);
            }

            activitiesByDate.get(dateKey)!.push(activity);
        });

        const weekStartDate = startOfWeek(today, {
            weekStartsOn: 0,
        });

        const weekDays = Array.from({ length: 7 }).map((_, index) => {
            const date = addDays(weekStartDate, index);
            const dateKey = date.toDateString();

            const dayActivities = activitiesByDate.get(dateKey) ?? [];

            const totalDayDuration = dayActivities.reduce(
                (sum, activity) => sum + activity.duration,
                0,
            );

            const totalDayDistance = dayActivities.reduce(
                (sum, activity) =>
                    sum + computeTotalDistance(activity.coordinates),
                0,
            );

            const totalDayGoal = dayActivities.reduce(
                (sum, activity) => sum + activity.goal,
                0,
            );

            const totalDayCalories = computeCalories(
                totalDayDistance,
                profile?.weight ?? 70,
            );

            const completionPct =
                totalDayGoal > 0
                    ? Math.min((totalDayDistance / totalDayGoal) * 100, 100)
                    : 0;

            return {
                date,
                label: format(date, "EEE"),
                dayNumber: format(date, "d"),

                totalDayDistance,
                totalDayDuration,
                totalDayCalories,
                totalDayGoal,

                completionPct,

                isToday: isSameDay(date, today),
                isFuture: date > today,
            };
        });

        const hasWeeklyActivity = weekDays.some(
            (day) => !day.isFuture && day.totalDayDistance > 0,
        );

        const totalDurationSec = convertMsToS(
            weekDays.reduce((sum, day) => sum + day.totalDayDuration, 0),
        );

        const totalCalories = weekDays.reduce(
            (sum, day) => sum + day.totalDayCalories,
            0,
        );

        const totalDistanceMeters = weekDays
            .filter((day) => !day.isFuture)
            .reduce((sum, day) => sum + day.totalDayDistance, 0);

        const totalGoalMeters = weekDays
            .filter((day) => !day.isFuture)
            .reduce((sum, day) => sum + day.totalDayGoal, 0);

        const totalDistanceKm = convertMtoKm(totalDistanceMeters);

        const totalGoalKm = convertMtoKm(totalGoalMeters);

        const averagePace = computePace(totalDistanceMeters, totalDurationSec);

        const weeklyGoalPct =
            totalGoalKm > 0 ? (totalDistanceKm / totalGoalKm) * 100 : 0;

        const currentStreak = (() => {
            let streak = 0;

            for (let i = weekDays.length - 1; i >= 0; i--) {
                const day = weekDays[i];

                if (day.isFuture) continue;

                if (day.completionPct >= 100) {
                    streak++;
                } else {
                    break;
                }
            }

            return streak;
        })();

        const weeklyMotivation = (() => {
            if (!hasWeeklyActivity) {
                return {
                    emoji: "✨",
                    text: "No activity this week yet — start today!",
                };
            }

            if (weeklyGoalPct >= 90) {
                return {
                    emoji: "🔥",
                    text: "On fire this week!",
                };
            }

            if (weeklyGoalPct >= 70) {
                return {
                    emoji: "💪",
                    text: "Strong week, keep it up!",
                };
            }

            if (weeklyGoalPct >= 50) {
                return {
                    emoji: "👟",
                    text: "Halfway there, push on!",
                };
            }

            if (weeklyGoalPct >= 25) {
                return {
                    emoji: "🚶",
                    text: "Every step counts!",
                };
            }

            return {
                emoji: "✨",
                text: "Let's get moving!",
            };
        })();

        return {
            weekDays,
            totalDistanceKm,
            totalDurationSec,
            totalGoalKm,
            averagePace,
            totalCalories,
            weeklyGoalPct,
            currentStreak,
            weeklyMotivation,
            hasWeeklyActivity,
        };
    }, [activities, today]);

    const stats = [
        {
            label: "Duration",
            value: formatDuration(totalDurationSec),
            unit: "hh:mm",
            icon: "time-outline",
        },
        {
            label: "Calories",
            value: formatCalories(totalCalories),
            unit: "kcal",
            icon: "flame-outline",
        },
        {
            label: "Avg. Pace",
            value: formatPace(averagePace),
            unit: "min/km",
            icon: "timer-outline",
        },
    ];

    return (
        <>
            <View className="px-4">
                {isLoading ? (
                    <Card className="h-60" />
                ) : (
                    <Card className="">
                        <ColView className="gap-4">
                            <ColView className="gap-4">
                                <RowView className="justify-between">
                                    <Text className="text-sm">This Week</Text>
                                    <RowView className="gap-2 items-center">
                                        {currentStreak > 0 && (
                                            <View className="hidden px-2 py-0.5 rounded-full bg-muted">
                                                <Text className="text-xs text-white">
                                                    🔥 {currentStreak} day
                                                    streak
                                                </Text>
                                            </View>
                                        )}
                                        {weekDays.length === 7 && (
                                            <Text className="text-sm text-muted-foreground">
                                                {format(
                                                    weekDays[0].date,
                                                    "MMM d",
                                                )}{" "}
                                                –{" "}
                                                {format(
                                                    weekDays[6].date,
                                                    "MMM d",
                                                )}
                                            </Text>
                                        )}
                                    </RowView>
                                </RowView>
                                <RowView className="gap-4 ">
                                    <Text className="text-5xl font-semibold text-foreground">
                                        {totalDistanceKm
                                            .toFixed(1)
                                            .toLocaleString()}
                                        {""}
                                        <Text className="text-xl">km</Text>
                                    </Text>
                                    <RowView className="flex-1 justify-end gap-4 items-end">
                                        {stats.map((stat, i) => {
                                            return (
                                                <ColView
                                                    key={stat.label}
                                                    className="gap-0"
                                                >
                                                    <Text className="text-xs text-muted-foreground">
                                                        {stat.label}
                                                    </Text>
                                                    <Text className="text-xl font-medium">
                                                        {stat.value}
                                                    </Text>
                                                    {/* <Text className="text-[6px] text-muted-foreground">
                                                    {stat.unit}
                                                </Text> */}
                                                </ColView>
                                            );
                                        })}
                                    </RowView>
                                </RowView>
                            </ColView>
                            <RowView className="gap-2">
                                <RowView className="flex-1 items-end gap-1">
                                    {weekDays.map((day, i) => (
                                        <TouchableOpacity
                                            key={i}
                                            disabled={day.isFuture}
                                            className="flex-1 items-center gap-1"
                                            onPress={() =>
                                                activityGrouperDrawer.current?.openWithActivityDate(
                                                    day.date.toDateString(),
                                                )
                                            }
                                        >
                                            <Card className="light h-16 w-full justify-end bg-muted rounded overflow-hidden p-0 border-0">
                                                {!day.isFuture && (
                                                    <View
                                                        style={{
                                                            height: `${day.completionPct}%`,
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
                                <View className="hidden relative items-center justify-center h-20 aspect-square">
                                    <RingChart
                                        pct={weeklyGoalPct}
                                        radius={30}
                                        strokeWidth={12}
                                        trackWidth={12}
                                        strokeLinecap="round"
                                        trackColor="rgba(128,128,128,0.08)"
                                        startDeg={180}
                                    />
                                    <Text className="absolute text-[11px] font-medium text-foreground">
                                        {weeklyGoalPct.toFixed(0)}
                                        <Text className="text-[9px] text-muted-foreground">
                                            %
                                        </Text>
                                    </Text>
                                </View>
                            </RowView>

                            <ColView className="gap-2">
                                <View className="h-1 bg-muted rounded-full overflow-hidden">
                                    <View
                                        style={{
                                            width: `${weeklyGoalPct}%`,
                                        }}
                                        className="h-1 bg-primary rounded"
                                    />
                                </View>
                                <RowView className="justify-between">
                                    <Text className="text-xs">
                                        {totalDistanceKm.toFixed(1)}km
                                    </Text>
                                    <Text className="text-xs">
                                        {weeklyGoalPct.toFixed(0)}%
                                    </Text>
                                    <Text className="text-xs">
                                        {totalGoalKm}km
                                    </Text>
                                </RowView>
                            </ColView>
                        </ColView>
                    </Card>
                )}
            </View>
            <ActivityGroupDrawer ref={activityGrouperDrawer} />
        </>
    );
}

export default memo(WeekActivity);
