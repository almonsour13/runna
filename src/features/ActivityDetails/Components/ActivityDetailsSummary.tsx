import { ColView, RowView } from "@/shared/components/CustomView";
import RingChart from "@/shared/components/ui/RingChart";
import Text from "@/shared/components/ui/Text";
import { useProfileStore } from "@/shared/stores/use-profile.store";
import { cn } from "@/shared/utils/cn";
import {
    computeCalories,
    computePace,
    computeSpeed,
    computeTotalDistance,
} from "@/shared/utils/compute";
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
import { useActivityDetails } from "../context/ActivityDetailsContext";

export default function ActivitySummary() {
    const profile = useProfileStore((s) => s.profile);
    const { activity } = useActivityDetails();

    const {
        dateLabel,
        timeRangeLabel,
        totalDistanceM,
        totalDistanceKm,

        goalDistanceKm,

        goalCompletionPct,

        totalDurationSec,

        activityStats,
    } = useMemo(() => {
        // ── Labels ──────────────────────────────────────────
        const dateLabel = [
            formatRelativeDateLabel(new Date(activity.startTime)),
            format(activity.startTime, "EEE"),
            format(activity.startTime, "MMM d, yyy"),
        ]
            .filter(Boolean)
            .join(" • ");

        const timeRangeLabel = [
            format(activity.startTime, "h:mm a"),
            format(activity.endTime, "h:mm a"),
        ].join(" - ");

        // ── Distance ────────────────────────────────────────
        const totalDistanceM = computeTotalDistance(activity.coordinates);
        const totalDistanceKm = Number(convertMtoKm(totalDistanceM));
        const goalDistanceKm = Number(convertMtoKm(activity.goal));

        // ── Goal ────────────────────────────────────────────
        const goalCompletionPct =
            goalDistanceKm > 0
                ? Math.min((totalDistanceKm / goalDistanceKm) * 100, 100)
                : 0;
        const goalReached = totalDistanceKm >= goalDistanceKm;
        const remainingKm = Math.max(goalDistanceKm - totalDistanceKm, 0);
        const exceededKm = Math.max(totalDistanceKm - goalDistanceKm, 0);

        // ── Duration ────────────────────────────────────────
        const totalDurationSec = convertMsToS(activity.duration);

        // ── Stats — use new utils ────────────────────────────

        const pace =
            totalDistanceKm > 0.01
                ? formatPace(computePace(totalDistanceM, totalDurationSec))
                : "--:--";

        const activityStats = [
            {
                label: "Duration",
                value: formatDuration(totalDurationSec),
                unit: "hh:mm",
                icon: "time-outline" as const,
            },
            {
                label: "Calories",
                value: formatCalories(
                    computeCalories(totalDistanceM, profile?.weight ?? 70),
                ),
                unit: "kcal",
                icon: "flame-outline" as const,
            },
            {
                label: "Pace",
                value: pace,
                unit: "min/km",
                icon: "timer-outline" as const,
            },
            {
                label: "Speed",
                value: formatSpeed(
                    computeSpeed(totalDistanceM, totalDurationSec),
                ),
                unit: "km/h",
                icon: "speedometer-outline" as const,
            },
        ];

        return {
            dateLabel,
            timeRangeLabel,
            totalDistanceM,
            totalDistanceKm,
            goalDistanceKm,

            goalCompletionPct,

            totalDurationSec,

            activityStats,
        };
    }, [activity, profile?.weight]);
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
                        {totalDistanceKm.toFixed(2)}
                        <Text className="font-medium text-2xl">km</Text>
                    </Text>
                </ColView>
                <View className="items-center justify-center">
                    <RingChart
                        pct={goalCompletionPct}
                        radius={28}
                        strokeWidth={8}
                        strokeLinecap="round"
                        trackColor="rgba(128,128,128,0.08)"
                    />
                    <Text className="absolute text-[11px] font-medium text-foreground">
                        {goalCompletionPct.toFixed(0)}
                        <Text className="text-[9px] text-muted-foreground">
                            %
                        </Text>
                    </Text>
                </View>
            </RowView>
            <View className="border-b border-border/40" />
            <RowView>
                {activityStats.map((stat, i) => (
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
