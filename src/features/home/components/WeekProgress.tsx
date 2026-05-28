import { ColView, RowView } from "@/shared/components/CustomView";
import Divider from "@/shared/components/Divider";
import ActivityGroupDrawer, {
    ActivityGroupDrawerHandle,
} from "@/shared/components/drawer/ActivityGroupDrawer";
import Card from "@/shared/components/ui/Card";
import Icon from "@/shared/components/ui/Icon";
import Text from "@/shared/components/ui/Text";
import { activityService } from "@/shared/services/storage/activity.service";
import { cn } from "@/shared/utils/cn";
import { computeStats } from "@/shared/utils/compute";
import { formatStats } from "@/shared/utils/format";
import { useQuery } from "@tanstack/react-query";
import { addDays, format, isToday, startOfWeek } from "date-fns";
import { useMemo, useRef } from "react";
import { TouchableOpacity, View } from "react-native";

export default function WeekProgress() {
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

    const stats = formatStats({
        distance: totalWeekDistance,
        duration: totalWeekDuration,
        calories: totalWeekCalories,
    });

    return (
        <>
            <View className="px-4">
                {isLoading ? (
                    <Card className="h-48" />
                ) : (
                    <Card className="">
                        <ColView className="gap-4">
                            <ColView className="gap-4">
                                <RowView className="justify-between">
                                    <Text className="text-base font-medium">
                                        This Week Progress
                                    </Text>
                                    {weekDays.length === 7 && (
                                        <Text className="text-sm text-muted-foreground">
                                            {format(weekDays[0].date, "MMM d")}{" "}
                                            –{" "}
                                            {format(weekDays[6].date, "MMM d")}
                                        </Text>
                                    )}
                                </RowView>
                                <RowView className="justify-between items-center">
                                    {stats.map((stat, i) => {
                                        if ("border" in stat) {
                                            return (
                                                <Divider
                                                    key={i}
                                                    direction="vertical"
                                                />
                                            );
                                        }
                                        return (
                                            <ColView
                                                key={stat.label}
                                                className={cn("")}
                                            >
                                                <RowView className="">
                                                    <Icon
                                                        name={stat.icon}
                                                        size={11}
                                                        className="text-primary"
                                                    />
                                                    <Text className="text-xs text-muted-foreground">
                                                        {stat.label}
                                                    </Text>
                                                </RowView>
                                                <Text
                                                    className={cn(
                                                        "text-3xl font-medium",
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
                                <RowView className="flex-1 items-end gap-2">
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
                                                <Card className="h-12 w-full justify-end bg-muted rounded overflow-hidden p-0 border-0">
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
