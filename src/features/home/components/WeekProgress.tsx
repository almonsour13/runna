import { ColView, RowView } from "@/shared/components/CustomView";
import Divider from "@/shared/components/Divider";
import ActivityGroupDrawer, {
    ActivityGroupDrawerHandle,
} from "@/shared/components/drawer/ActivityGroupDrawer";
import Card from "@/shared/components/ui/Card";
import Icon from "@/shared/components/ui/Icon";
import Text from "@/shared/components/ui/Text";
import { useFormatMetrics } from "@/shared/hooks/use-format-metrics";
import { activityService } from "@/shared/services/storage/activity.service";
import { cn } from "@/shared/utils/cn";
import { computeMetrics } from "@/shared/utils/compute";
import { convertMtoKm } from "@/shared/utils/convert";
import { useQuery } from "@tanstack/react-query";
import { addDays, format, isToday, startOfWeek } from "date-fns";
import { useMemo, useRef } from "react";
import { TouchableOpacity, View } from "react-native";

export default function WeekProgress() {
    const activityGrouperDrawer = useRef<ActivityGroupDrawerHandle>(null);

    const { today, weekStartDate, weekEndDate } = useMemo(() => {
        const today = new Date();
        const weekStartDate = startOfWeek(today, { weekStartsOn: 0 });
        const weekEndDate = addDays(weekStartDate, 6);
        weekEndDate.setHours(23, 59, 59, 999);
        return { today, weekStartDate, weekEndDate };
    }, []);

    const { data: activities = [], isLoading } = useQuery({
        queryKey: ["home", "week"],
        queryFn: () =>
            activityService.getByDateRange(weekStartDate, weekEndDate),
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

        return Array.from({ length: 7 }).map((_, index) => {
            const date = addDays(weekStartDate, index);
            const dateKey = date.toDateString();
            const dayActivities = activityByWeekDay.get(dateKey) ?? [];
            const { distance, duration, calories, steps } =
                computeMetrics(dayActivities);

            return {
                date,
                dateKey,
                totalDayDistance: distance,
                totalDayDuration: duration,
                totalDayCalories: calories,
                totalDaySteps: steps,
                isFuture: date > today,
                isToday: isToday(date),
                count: dayActivities.length,
            };
        });
    }, [activities, weekStartDate, today]);

    const {
        totalWeekDistance,
        totalWeekDuration,
        totalWeekCalories,
        totalWeekSteps,
        maxDayDistance,
        activeDays,
        bestDay,
    } = useMemo(() => {
        const totalWeekDistance = weekDays.reduce(
            (s, d) => s + d.totalDayDistance,
            0,
        );
        const totalWeekDuration = weekDays.reduce(
            (s, d) => s + d.totalDayDuration,
            0,
        );
        const totalWeekCalories = weekDays.reduce(
            (s, d) => s + d.totalDayCalories,
            0,
        );
        const totalWeekSteps = weekDays.reduce(
            (s, d) => s + d.totalDaySteps,
            0,
        );

        const maxDist = Math.max(...weekDays.map((d) => d.totalDayDistance), 0);
        const maxDayDistance = maxDist === 0 ? 1 : maxDist;

        const activeDays = weekDays.filter(
            (d) => !d.isFuture && d.count > 0,
        ).length;

        const bestDay = weekDays.reduce(
            (best, d) =>
                d.totalDayDistance > (best?.totalDayDistance ?? 0) ? d : best,
            null as (typeof weekDays)[0] | null,
        );

        return {
            totalWeekDistance,
            totalWeekDuration,
            totalWeekCalories,
            totalWeekSteps,
            maxDayDistance,
            activeDays,
            bestDay,
        };
    }, [weekDays]);

    const stats = useFormatMetrics({
        distance: totalWeekDistance,
        duration: totalWeekDuration,
        calories: totalWeekCalories,
        steps: totalWeekSteps,
    });

    const elapsedDays = weekDays.filter((d) => !d.isFuture).length;
    const distance = stats[0];
    const dateRangeLabel =
        weekDays.length === 7
            ? `${format(weekDays[0].date, "MMM d")} – ${format(weekDays[6].date, "MMM d")}`
            : null;

    return (
        <>
            <View className="px-4">
                {isLoading ? (
                    <ColView className="gap-1">
                        <Card className="h-52" />
                        <RowView className="gap-1">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <Card key={i} className="h-20 flex-1" />
                            ))}
                        </RowView>
                    </ColView>
                ) : (
                    <ColView className="gap-1">
                        <Card>
                            <ColView className="gap-2">
                                {/* Header */}
                                <RowView className="justify-between items-center">
                                    <Text className="text-base font-medium">
                                        This Week Progress
                                    </Text>
                                    {dateRangeLabel && (
                                        <Text className="text-sm text-muted-foreground">
                                            {dateRangeLabel}
                                        </Text>
                                    )}
                                </RowView>

                                <RowView className="justify-between items-end">
                                    <ColView className="gap-0.5">
                                        <RowView>
                                            {distance?.value.map((v, i) => (
                                                <Text
                                                    key={i}
                                                    className="text-3xl font-medium"
                                                >
                                                    {v.value}
                                                    {distance.key !==
                                                        "duration" && " "}
                                                    <Text className="text-xl font-medium">
                                                        {v.unit}
                                                    </Text>
                                                </Text>
                                            ))}
                                        </RowView>
                                        <Text className="text-xs capitalize text-muted-foreground">
                                            Total distance this week
                                        </Text>
                                    </ColView>

                                    {/* Active days + best day */}
                                    <ColView className="items-end gap-0.5">
                                        <RowView className="items-center gap-1">
                                            <Icon
                                                name="flame"
                                                size={12}
                                                className="text-primary"
                                            />
                                            <Text className="text-sm font-medium text-primary capitalize">
                                                {activeDays} / {elapsedDays}{" "}
                                                days active
                                            </Text>
                                        </RowView>
                                        {bestDay &&
                                            bestDay.totalDayDistance > 0 && (
                                                <Text className="text-xs text-muted-foreground">
                                                    Best:{" "}
                                                    {format(
                                                        bestDay.date,
                                                        "EEE",
                                                    )}{" "}
                                                    ·{" "}
                                                    {convertMtoKm(
                                                        bestDay.totalDayDistance,
                                                    ).toFixed(1)}{" "}
                                                    km
                                                </Text>
                                            )}
                                    </ColView>
                                </RowView>

                                {/* Bar chart */}
                                <RowView className="items-end gap-1">
                                    {weekDays.map((day, i) => {
                                        const hasDistance =
                                            day.totalDayDistance > 0;
                                        const pct = hasDistance
                                            ? Math.max(
                                                  (day.totalDayDistance /
                                                      maxDayDistance) *
                                                      100,
                                                  8,
                                              )
                                            : 0;
                                        const kmLabel = convertMtoKm(
                                            day.totalDayDistance,
                                        ).toFixed(1);

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
                                                <Card className="h-16 w-full justify-end bg-muted rounded overflow-hidden p-0 border-0">
                                                    {!day.isFuture &&
                                                        hasDistance && (
                                                            <ColView className="h-full justify-end items-center gap-1">
                                                                <Text
                                                                    className={cn(
                                                                        "hidden text-[9px] font-semibold leading-none ",
                                                                        day.isToday
                                                                            ? "text-foreground font-bold"
                                                                            : "text-muted-foreground",
                                                                    )}
                                                                >
                                                                    {kmLabel}{" "}
                                                                    {day.date.getDate()}
                                                                </Text>
                                                                <View
                                                                    style={{
                                                                        height: `${pct}%`,
                                                                    }}
                                                                    className={cn(
                                                                        "w-full rounded items-center justify-start pt-0.5",
                                                                        day.isToday
                                                                            ? "bg-primary"
                                                                            : "bg-primary/30",
                                                                    )}
                                                                />
                                                            </ColView>
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
                            </ColView>
                        </Card>
                        <RowView className="justify-between items-center gap-1">
                            {stats.slice(1).map((stat, i) => {
                                if ("border" in stat) {
                                    return (
                                        <Divider key={i} direction="vertical" />
                                    );
                                }
                                return (
                                    <Card key={stat.label} className="flex-1">
                                        <ColView className="flex-1 justify-center gap-1">
                                            <RowView className="gap-1 items-center">
                                                <Icon
                                                    name={stat.icon}
                                                    size={12}
                                                    className="text-primary"
                                                />
                                                <Text className="text-xs text-muted-foreground">
                                                    {stat.label}
                                                </Text>
                                            </RowView>
                                            <RowView>
                                                {stat.value.map((v, i) => (
                                                    <Text
                                                        key={i}
                                                        className="text-xl font-medium"
                                                    >
                                                        {v.value}
                                                        {stat.key !==
                                                            "duration" && " "}
                                                        <Text className="text-base font-medium">
                                                            {v.unit}
                                                        </Text>
                                                    </Text>
                                                ))}
                                            </RowView>
                                        </ColView>
                                    </Card>
                                );
                            })}
                        </RowView>
                    </ColView>
                )}
            </View>
            <ActivityGroupDrawer ref={activityGrouperDrawer} />
        </>
    );
}
