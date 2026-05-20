import { ColView, RowView } from "@/shared/components/CustomView";
import RingChart from "@/shared/components/ui/RingChart";
import Text from "@/shared/components/ui/Text";
import { Activity } from "@/shared/types/type";
import { cn } from "@/shared/utils/cn";
import { convertMsToS, convertMtoKm } from "@/shared/utils/convert";
import {
    formatCalories,
    formatDuration,
    formatPace,
    formatRelativeDateLabel,
    formatSpeed,
} from "@/shared/utils/format";
import Ionicons from "@expo/vector-icons/Ionicons";
import { format } from "date-fns";
import { useMemo } from "react";
import { View } from "react-native";

export default function ActivitySummary({ activity }: { activity: Activity }) {
    const { distanceKm, durationSec, calories, goalKm, pace, speed } =
        useMemo(() => {
            const distance = activity?.distance ?? 0;
            const duration = activity?.duration ?? 0;
            const calories = activity?.calories ?? 0;
            const pace = activity?.avgPace ?? 0;
            const speed = activity?.avgSpeed ?? 0;
            const goal = activity?.goal ?? 0;

            const distanceKm = convertMtoKm(distance);
            const goalKm = convertMtoKm(goal);
            const durationSec = convertMsToS(duration);

            return {
                distanceKm,
                durationSec,
                goalKm,
                calories,
                pace,
                speed,
            };
        }, [activity]);
    const pct = (distanceKm / goalKm) * 100 || 0;

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

    const stats = [
        {
            label: "Duration",
            value: formatDuration(durationSec),
            unit: null,
            icon: "time" as const,
        },
        {
            label: "Calories",
            value: formatCalories(calories),
            unit: "kcal",
            icon: "flame" as const,
        },
        {
            label: "Pace",
            value: formatPace(pace),
            unit: "min/km",
            icon: "timer" as const,
        },
        {
            label: "Speed",
            value: formatSpeed(speed),
            unit: "km/h",
            icon: "speedometer" as const,
        },
    ];
    return (
        <ColView className="p-4 pb-8 gap-4">
            <RowView className="justify-between items-start">
                <ColView className="gap-1">
                    <Text className="text-base font-medium">{dateLabel}</Text>
                    <Text className="text-xs text-muted-foreground">
                        {timeRangeLabel}
                    </Text>
                </ColView>
                <Text className="text-base">Run</Text>
            </RowView>
            <View className="border-b border-border/40" />
            <RowView className="justify-between">
                <ColView className="gap-1">
                    <RowView className="gap-1 items-center">
                        <Ionicons
                            name="navigate"
                            size={11}
                            className="text-primary"
                        />
                        <Text className="text-sm text-muted-foreground">
                            Distance
                        </Text>
                    </RowView>
                    <Text className="text-6xl font-medium">
                        {distanceKm.toFixed(2)}
                        <Text className="text-muted-foreground font-medium text-2xl">
                            {" "}
                            / {goalKm.toFixed(0)} km
                        </Text>
                    </Text>
                </ColView>
                <ColView className="relative gap-1">
                    <RingChart
                        pct={pct}
                        radius={28}
                        trackColor="transparent"
                        startDeg={180}
                    />
                    <View className="absolute inset-0 justify-center items-center">
                        <Text className="text-base font-semibold">
                            {pct.toFixed(0)}
                            <Text className="text-xs">%</Text>
                        </Text>
                    </View>
                </ColView>
            </RowView>
            <View className="border-b border-border/40" />
            <RowView className="justify-between flex-wrap items-center gap-4">
                {stats.map((stat, i) => {
                    return (
                        <ColView key={stat.label} className={cn("gap-1")}>
                            <RowView className="gap-1 items-center">
                                <Ionicons
                                    name={stat.icon}
                                    size={11}
                                    className="text-primary"
                                />
                                <Text className="text-xs text-muted-foreground">
                                    {stat.label}
                                </Text>
                            </RowView>
                            <Text className="text-2xl font-medium text-foreground leading-none">
                                {stat.value}{" "}
                                {stat.unit && (
                                    <Text className="text-xs">{stat.unit}</Text>
                                )}
                            </Text>
                        </ColView>
                    );
                })}
            </RowView>
        </ColView>
    );
}
