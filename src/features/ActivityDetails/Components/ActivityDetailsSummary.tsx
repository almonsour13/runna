import { ColView, RowView } from "@/shared/components/CustomView";
import Icon from "@/shared/components/Icon";
import Card from "@/shared/components/ui/Card";
import Text from "@/shared/components/ui/Text";
import { Activity } from "@/shared/types/type";
import { convertMtoKm } from "@/shared/utils/convert";
import { formatRelativeDateLabel, formatStats } from "@/shared/utils/format";
import { format } from "date-fns";
import { useMemo } from "react";
import { View } from "react-native";

export default function ActivityDetailsSummary({
    activity,
}: {
    activity: Activity;
}) {
    const { distance, duration, calories, pace, speed, steps, goal } =
        useMemo(() => {
            const distance = activity?.distance ?? 0;
            const duration = activity?.duration ?? 0;
            const calories = activity?.calories ?? 0;
            const pace = activity?.avgPace ?? 0;
            const speed = activity?.avgSpeed ?? 0;
            const steps = activity?.steps ?? 0;
            const goal = activity?.goal ?? 0;
            return {
                distance,
                duration,
                calories,
                pace,
                speed,
                steps,
                goal,
            };
        }, [activity]);

    const pct = (distance / goal) * 100 || 0;
    const barPct = Math.min(pct, 100);
    const distanceKm = convertMtoKm(distance);
    const goalKm = convertMtoKm(goal);
    const isGoalMet = distance >= goal;
    const isGoalExceeded = pct > 100;

    const dateLabel =
        activity &&
        [
            formatRelativeDateLabel(new Date(activity.startTime)),
            format(activity.startTime, "EEE"),
            format(activity.startTime, "MMM d, yyy"),
        ]
            .filter(Boolean)
            .join(" • ");

    const timeRangeLabel =
        activity &&
        [
            format(activity.startTime, "h:mm a"),
            format(activity.endTime, "h:mm a"),
        ].join(" - ");
    const stats = formatStats({
        distance,
        duration,
        calories,
        pace,
        speed,
        steps,
    });

    return (
        <ColView className="p-4 gap-4 ">
            <RowView className="justify-between items-start">
                <ColView className="gap-1">
                    <Text className="text-base font-medium">{dateLabel}</Text>
                    <Text className="text-xs text-muted-foreground">
                        {timeRangeLabel}
                    </Text>
                </ColView>
                <RowView>
                    {activity.isImported && (
                        <Text className="capitalize text-xs font-medium text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                            Imported
                        </Text>
                    )}
                    <Text className="capitalize text-xs font-medium text-primary bg-muted px-1.5 py-0.5 rounded">
                        {activity.type}
                    </Text>
                </RowView>
            </RowView>
            <ColView>
                <RowView className="justify-between items-center">
                    <Text className="text-base font-medium">Goal Progress</Text>
                    <RowView>
                        {isGoalExceeded && (
                            <Text className="capitalize text-xs font-medium text-primary bg-muted px-1.5 py-0.5 rounded">
                                +{(pct - 100).toFixed(0)}% over
                            </Text>
                        )}
                        {isGoalMet && (
                            <Text className="capitalize text-xs font-medium text-primary bg-muted px-1.5 py-0.5 rounded">
                                Goal Met
                            </Text>
                        )}
                    </RowView>
                </RowView>
                <View className="h-1 bg-muted rounded overflow-hidden">
                    <View
                        style={{
                            height: `${pct}%`,
                        }}
                        className="h-2 bg-primary"
                    />
                </View>
                <RowView className="justify-between">
                    <RowView className="items-center">
                        <Icon name="navigate" size={12} />
                        <Text className="text-sm">
                            {distanceKm.toFixed(1)} km
                        </Text>
                    </RowView>
                    <Text className="text-sm text-primary">
                        {pct.toFixed(1)} %
                    </Text>
                    <RowView className="items-center">
                        <Icon name="flag" size={12} />
                        <Text className="text-sm">{goalKm.toFixed(1)} km</Text>
                    </RowView>
                </RowView>
            </ColView>
            <RowView className=" flex-wrap">
                {stats.map((stat, i) => {
                    return (
                        <Card
                            key={stat.label}
                            className="flex-1 min-w-[30%] border-border border bg-transparent"
                        >
                            <ColView>
                                <RowView className="items-center">
                                    <Icon
                                        name={stat.icon}
                                        size={11}
                                        className="text-primary"
                                    />
                                    <Text className="text-xs text-muted-foreground">
                                        {stat.label}
                                    </Text>
                                </RowView>
                                <Text className="text-xl font-medium leading-none">
                                    {stat.value}{" "}
                                    {stat.unit && (
                                        <Text className="text-xs">
                                            {stat.unit}
                                        </Text>
                                    )}
                                </Text>
                            </ColView>
                        </Card>
                    );
                })}
            </RowView>
        </ColView>
    );
}
