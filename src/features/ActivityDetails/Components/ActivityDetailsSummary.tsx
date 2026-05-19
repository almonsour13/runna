import { ColView, RowView } from "@/shared/components/CustomView";
import Text from "@/shared/components/ui/Text";
import { Activity } from "@/shared/db/repositories/activity.repository";
import { cn } from "@/shared/utils/cn";
import { convertMsToS, convertMtoKm } from "@/shared/utils/convert";
import {
    formatCalories,
    formatDuration,
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
            const goal = activity?.goal ?? 0;
            const pace = activity?.avgPace ?? 0;
            const speed = activity?.avgSpeed ?? 0;

            const distanceKm = convertMtoKm(activity?.distance ?? 0);
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
            unit: "hh:mm",
            icon: "time-outline" as const,
        },
        {
            label: "Calories",
            value: formatCalories(calories),
            unit: "kcal",
            icon: "flame-outline" as const,
        },
        {
            label: "Pace",
            value: "5:22",
            unit: "min/km",
            icon: "timer-outline" as const,
        },
        {
            label: "Speed",
            value: formatSpeed(speed),
            unit: "km/h",
            icon: "speedometer-outline" as const,
        },
    ];
    return (
        <ColView className="px-4 gap-4">
            <RowView className="justify-between items-end">
                <RowView className="gap-0">
                    <Text className="text-base font-medium">{dateLabel}</Text>
                </RowView>
                <Text className="text-base text-muted-foreground font-medium">
                    {timeRangeLabel}
                </Text>
            </RowView>
            <RowView className="justify-between">
                <ColView className="gap-1">
                    <RowView className="gap-1 items-center">
                        <Ionicons
                            name="location-outline"
                            size={12}
                            className="text-primary"
                        />
                        <Text className="text-sm text-muted-foreground">
                            Distance
                        </Text>
                    </RowView>
                    <Text className="text-6xl font-bold">
                        {distanceKm.toFixed(2)}
                        <Text className="font-medium text-2xl">km</Text>
                    </Text>
                </ColView>
            </RowView>
            <View className="border-b border-border/40" />
            <RowView>
                {stats.map((stat, i) => (
                    <ColView
                        key={stat.label}
                        className={cn(
                            "flex-1 gap-1",
                            i > 0 && "pl-4 border-l border-border/40",
                        )}
                    >
                        <RowView className="gap-1 items-center">
                            <Ionicons
                                name={stat.icon}
                                size={10}
                                className="text-primary"
                            />
                            <Text className="text-[10px] text-muted-foreground">
                                {stat.label}
                            </Text>
                        </RowView>
                        <Text className="text-xl font-medium text-foreground leading-none">
                            {stat.value}
                        </Text>
                        {stat.unit && (
                            <Text className="text-[9px] text-muted-foreground">
                                {stat.unit}
                            </Text>
                        )}
                    </ColView>
                ))}
            </RowView>
        </ColView>
    );
}
