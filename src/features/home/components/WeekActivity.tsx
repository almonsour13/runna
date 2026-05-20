import { ColView, RowView } from "@/shared/components/CustomView";
import ActivityGroupDrawer, {
    ActivityGroupDrawerHandle,
} from "@/shared/components/drawer/ActivityGroupDrawer";
import Card from "@/shared/components/ui/Card";
import Text from "@/shared/components/ui/Text";
import { activityService } from "@/shared/services/storage/activity.service";
import { cn } from "@/shared/utils/cn";
import { computeStats } from "@/shared/utils/compute";
import { convertMsToS, convertMtoKm } from "@/shared/utils/convert";
import { formatCalories, formatDuration } from "@/shared/utils/format";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { addDays, format, isToday, startOfWeek } from "date-fns";
import { memo, useMemo, useRef } from "react";
import { TouchableOpacity, View } from "react-native";

function WeekActivity() {
    const activityGrouperDrawer = useRef<ActivityGroupDrawerHandle>(null);
    const today = useMemo(() => new Date(), []);
    const weekStartDate = useMemo(
        () => startOfWeek(today, { weekStartsOn: 0 }),
        [today],
    );
    const weekEndDate = useMemo(
        () => addDays(weekStartDate, 6),
        [weekStartDate],
    );

    const {
        data: activities = [],
        isLoading,
        error,
    } = useQuery({
        queryKey: ["home", "week"],
        queryFn: async () => {
            const data = await activityService.getByDateRange(
                weekStartDate,
                weekEndDate,
            );
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

            const { distance, duration, calories } =
                computeStats(dayActivities);

            return {
                date,
                dateKey,
                totalDayDistance: distance,
                totalDayDuration: duration,
                totalDayCalories: calories,
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
    const totalWeekDistanceKm = convertMtoKm(totalWeekDistance);

    const stats = [
        {
            label: "Distance",
            value: totalWeekDistanceKm.toFixed(1),
            unit: "km",
            icon: "navigate",
            color: "text-primary",
        },
        {
            border: true,
        },
        {
            label: "Duration",
            value: formatDuration(convertMsToS(totalWeekDuration)),
            unit: null,
            icon: "time",
            color: "text-blue-500",
        },
        {
            border: true,
        },
        {
            label: "Calories",
            value: formatCalories(totalWeekCalories),
            unit: "kcal",
            icon: "flame",
            color: "text-red-500",
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
                                    <Text className="text-base font-medium">
                                        This Week
                                    </Text>
                                    {weekDays.length === 7 && (
                                        <Text className="text-sm text-muted-foreground">
                                            {format(weekDays[0].date, "MMM d")}{" "}
                                            –{" "}
                                            {format(weekDays[6].date, "MMM d")}
                                        </Text>
                                    )}
                                </RowView>
                                <RowView className="flex-1 justify-between items-center">
                                    {stats.map((stat, i) => {
                                        if ("border" in stat) {
                                            return (
                                                <View
                                                    key={i}
                                                    className="h-full w-px bg-muted"
                                                />
                                            );
                                        }
                                        return (
                                            <ColView
                                                key={stat.label}
                                                className={cn("gap-1")}
                                            >
                                                <RowView className="gap-1">
                                                    <Ionicons
                                                        name={stat.icon as any}
                                                        size={11}
                                                        className="text-primary"
                                                    />
                                                    <Text className="text-xs text-muted-foreground">
                                                        {stat.label}
                                                    </Text>
                                                </RowView>
                                                <Text
                                                    className={cn(
                                                        "text-3xl font-bold",
                                                    )}
                                                >
                                                    {stat.value}{" "}
                                                    {stat.unit && (
                                                        <Text className="text-xs font-normal text-muted-foreground">
                                                            {stat.unit}
                                                        </Text>
                                                    )}
                                                </Text>
                                            </ColView>
                                        );
                                    })}
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
                                                <Card className="h-12 w-full justify-end bg-muted/50 rounded overflow-hidden p-0 border-0">
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
