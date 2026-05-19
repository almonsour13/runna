import { ColView, RowView } from "@/shared/components/CustomView";
import ActivityGroupDrawer, {
    ActivityGroupDrawerHandle,
} from "@/shared/components/drawer/ActivityGroupDrawer";
import Card from "@/shared/components/ui/Card";
import Text from "@/shared/components/ui/Text";
import { homeService } from "@/shared/services/storage/home.service";
import { cn } from "@/shared/utils/cn";
import { convertMsToS, convertMtoKm } from "@/shared/utils/convert";
import {
    formatCalories,
    formatDuration,
    formatPace,
} from "@/shared/utils/format";
import { useQuery } from "@tanstack/react-query";
import { addDays, format, isToday, startOfWeek } from "date-fns";
import { memo, useMemo, useRef } from "react";
import { TouchableOpacity, View } from "react-native";

function WeekActivity() {
    const activityGrouperDrawer = useRef<ActivityGroupDrawerHandle>(null);
    const today = useMemo(() => new Date(), []);
    const {
        data: activities = [],
        isLoading,
        error,
    } = useQuery({
        queryKey: ["home", "week"],
        queryFn: async () => {
            const data = await homeService.getWeekActivity();
            return data;
        },
        staleTime: 0,
    });

    const weekDays = useMemo(() => {
        const activityByWeekDay = new Map<string, typeof activities>();
        activities.forEach((activity) => {
            const dateKey = new Date(activity.createdAt).toDateString();
            if (!activityByWeekDay.has(dateKey)) {
                activityByWeekDay.set(dateKey, []);
            }
            activityByWeekDay.get(dateKey)!.push(activity);
        });

        const weekStartDate = startOfWeek(today, { weekStartsOn: 0 });

        return Array.from({ length: 7 }).map((_, index) => {
            const date = addDays(weekStartDate, index);
            const dateKey = date.toDateString();
            const dayActivities = activityByWeekDay.get(dateKey) ?? [];

            const totalDayDistance = dayActivities.reduce(
                (sum, a) => sum + a.distance,
                0,
            );
            const totalDayCalories = dayActivities.reduce(
                (sum, a) => sum + a.calories,
                0,
            );
            const totalDayDuration = dayActivities.reduce(
                (sum, a) => sum + a.duration,
                0,
            );
            const totalDayAvgPace = dayActivities.length
                ? dayActivities.reduce((sum, a) => sum + (a.avgPace ?? 0), 0) /
                  dayActivities.length
                : 0;
            const totalDayAvgSpeed = dayActivities.length
                ? dayActivities.reduce((sum, a) => sum + (a.avgSpeed ?? 0), 0) /
                  dayActivities.length
                : 0;
            const totalDayGoal = dayActivities.reduce(
                (sum, a) => sum + a.goal,
                0,
            );

            return {
                date,
                dateKey,
                totalDayDistance,
                totalDayDuration,
                totalDayCalories,
                totalDayAvgPace,
                totalDayAvgSpeed,
                totalDayGoal,
                isFuture: date > today,
                isToday: isToday(date),
                count: dayActivities.length,
            };
        });
    }, [activities]);

    const activeDays = weekDays.filter((d) => d.count > 0).length;

    const totalWeekDistance = weekDays.reduce(
        (sum, day) => sum + day.totalDayDistance,
        0,
    );

    const totalWeekDuration = weekDays.reduce(
        (sum, day) => sum + day.totalDayDuration,
        0,
    );
    const totalWeekCalories = weekDays.reduce(
        (sum, day) => sum + day.totalDayCalories,
        0,
    );

    const totalWeekAvgPace = activeDays
        ? weekDays.reduce((sum, day) => sum + day.totalDayAvgPace, 0) /
          activeDays
        : 0;
    const totalWeekAvgSpeed = activeDays
        ? weekDays.reduce((sum, day) => sum + day.totalDayAvgSpeed, 0) /
          activeDays
        : 0;

    const totalWeekDistanceKm = convertMtoKm(totalWeekDistance);

    const stats = [
        {
            label: "Duration",
            value: formatDuration(convertMsToS(totalWeekDuration)),
            unit: "hh:mm",
            icon: "time-outline",
        },
        {
            label: "Calories",
            value: formatCalories(totalWeekCalories),
            unit: "kcal",
            icon: "flame-outline",
        },
        {
            label: "Avg. Pace",
            value: formatPace(totalWeekAvgPace),
            unit: "min/km",
            icon: "timer-outline",
        },
    ];

    const currentStreak = (() => {
        let streak = 0;

        return streak;
    })();

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
                                        {totalWeekDistanceKm
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
                                    {weekDays.map((day, i) => {
                                        const maxDayDistance = Math.max(
                                            ...weekDays.map(
                                                (d) => d.totalDayDistance,
                                            ),
                                            1,
                                        );
                                        const totalDayPct =
                                            (day.totalDayDistance /
                                                maxDayDistance) *
                                            100;

                                        return (
                                            <TouchableOpacity
                                                key={i}
                                                disabled={day.isFuture}
                                                className="flex-1 items-center gap-1"
                                                onPress={() =>
                                                    activityGrouperDrawer.current?.openWithActivityDate(
                                                        day.date,
                                                    )
                                                }
                                            >
                                                <Card className="h-16 w-full justify-end bg-muted/50 rounded overflow-hidden p-0 border-0">
                                                    {!day.isFuture && (
                                                        <View
                                                            style={{
                                                                height: `${totalDayPct}%`,
                                                            }}
                                                            className={cn(
                                                                "rounded",
                                                                day.isToday
                                                                    ? "bg-primary"
                                                                    : "bg-primary/20",
                                                            )}
                                                        />
                                                    )}
                                                </Card>
                                                <Text
                                                    className={cn(
                                                        "text-xs",
                                                        day.isToday
                                                            ? "text-foreground font-bold"
                                                            : "text-muted-foreground",
                                                    )}
                                                >
                                                    {format(day.date, "EEE")}
                                                </Text>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </RowView>
                            </RowView>
                        </ColView>
                    </Card>
                )}
            </View>
            <ActivityGroupDrawer ref={activityGrouperDrawer} />
        </>
    );
}

export default memo(WeekActivity);
