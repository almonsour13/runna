import { ColView, RowView } from "@/shared/components/CustomView";
import RingChart from "@/shared/components/ui/RingChart";
import Text from "@/shared/components/ui/Text";
import { useProfileStore } from "@/shared/stores/use-profile.store";
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
    formatSpeed,
} from "@/shared/utils/format";
import Ionicons from "@expo/vector-icons/Ionicons";
import { format, isToday, isYesterday } from "date-fns";
import { useMemo } from "react";
import { View } from "react-native";
import { useActivityDetails } from "../context/ActivityDetailsContext";

export default function ActivitySummary() {
    const profile = useProfileStore((s) => s.profile);
    const { activity } = useActivityDetails();

    const {
        activityDateLabel,
        activityStartTimeLabel,
        activityEndTimeLabel,

        totalDistanceM,
        totalDistanceKm,

        goalDistanceM,
        goalDistanceKm,

        goalCompletionPct,

        totalDurationSec,

        activityStats,
    } = useMemo(() => {
        const activityDateLabel = isToday(activity.startTime)
            ? "Today"
            : isYesterday(activity.startTime)
              ? "Yesterday"
              : format(activity.startTime, "EEEE, MMM d yyyy");

        const activityStartTimeLabel = format(activity.startTime, "h:mm a");

        const activityEndTimeLabel = activity.endTime
            ? format(activity.endTime, "h:mm a")
            : "Ongoing";

        const totalDistanceM = computeTotalDistance(activity.coordinates);

        const totalDistanceKm = Number(convertMtoKm(totalDistanceM));

        const goalDistanceM = activity.goal;

        const goalDistanceKm = Number(convertMtoKm(goalDistanceM));

        const goalCompletionPct =
            goalDistanceKm > 0
                ? Math.min((totalDistanceKm / goalDistanceKm) * 100, 100)
                : 0;

        const totalDurationSec = convertMsToS(activity.duration);

        const pace =
            totalDistanceKm > 0.01
                ? formatPace(
                      computePace(
                          totalDistanceM,
                          convertMsToS(totalDurationSec),
                      ),
                  )
                : "00:00";

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
            activityDateLabel,
            activityStartTimeLabel,
            activityEndTimeLabel,

            totalDistanceM,
            totalDistanceKm,

            goalDistanceM,
            goalDistanceKm,

            goalCompletionPct,

            totalDurationSec,

            activityStats,
        };
    }, [activity, profile?.weight]);

    return (
        <ColView className="flex-1 px-4 gap-4">
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
                        {totalDistanceKm.toFixed(1)}{" "}
                        <Text className="text-muted-foreground font-medium text-2xl">
                            / {goalDistanceKm.toFixed(1)} km
                        </Text>
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
            <RowView className="gap-2">
                {activityStats.map((stat) => (
                    <ColView key={stat.label} className="flex-1 gap-1">
                        <RowView className="gap-1 items-center">
                            <Ionicons
                                name={stat.icon}
                                size={12}
                                className="text-primary"
                            />
                            <Text className="text-xs text-muted-foreground">
                                {stat.label}
                            </Text>
                        </RowView>
                        <Text className="text-2xl font-medium">
                            {stat.value}
                        </Text>
                        {stat.unit && (
                            <Text className="text-xs font-medium text-muted-foreground">
                                {stat.unit}
                            </Text>
                        )}
                    </ColView>
                ))}
            </RowView>
        </ColView>
    );
}
