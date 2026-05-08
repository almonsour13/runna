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
import { capitalize } from "@/shared/utils/utils";
import Ionicons from "@expo/vector-icons/Ionicons";
import { format, isToday, isYesterday } from "date-fns";
import { View } from "react-native";
import { useActivityDetails } from "../context/ActivityDetailsContext";

export default function ActivitySummary() {
    const profile = useProfileStore((s) => s.profile);
    const { activity } = useActivityDetails();

    const dateLabel = isToday(activity.startTime)
        ? "Today"
        : isYesterday(activity.startTime)
          ? "Yesterday"
          : format(activity.startTime, "EEEE, MMM d yyyy");

    const timeRange = [
        dateLabel,
        format(activity.startTime, "p"),
        format(activity.endTime, "p"),
    ].join(" • ");

    const distance = computeTotalDistance(activity.coordinates);
    const distanceKm = Number(convertMtoKm(distance));
    const goalKm = Number(convertMtoKm(activity.goal));
    const pct = (distanceKm / goalKm) * 100 || 0;
    const clampedPct = Math.min(pct, 100);
    const remainingKm = Math.max(goalKm - distanceKm, 0);
    const durationSec = convertMsToS(activity.duration);

    const avgPaceVal = computePace(distance, durationSec);
    const avgSpeedVal = computeSpeed(distance, durationSec);

    const stats = [
        {
            label: "Duration",
            value: formatDuration(durationSec),
            unit: "hh:mm",
            icon: "time-outline" as const,
        },
        {
            label: "Calories",
            value: formatCalories(
                computeCalories(distance, profile?.weight || 70),
            ),
            unit: "kcal",
            icon: "flame-outline" as const,
        },
        {
            label: "Pace",
            value: formatPace(avgPaceVal),
            unit: "min/km",
            icon: "timer-outline" as const,
        },
        {
            label: "Speed",
            value: formatSpeed(avgSpeedVal),
            unit: "km/h",
            icon: "speedometer-outline" as const,
        },
    ];

    return (
        <ColView className="flex-1 px-4 pt-0 gap-4">
            <RowView className="justify-between items-center">
                <Text className="text-base text-muted-foreground">
                    {timeRange}
                </Text>
                <Text className="text-base font-medium text-primary">
                    {capitalize(activity.type)}
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
                        {distanceKm.toFixed(1)}{" "}
                        <Text className="text-muted-foreground font-medium text-2xl">
                            / {goalKm.toFixed(1)} km
                        </Text>
                    </Text>
                    <Text className="text-xs text-muted-foreground">
                        {remainingKm > 0
                            ? `${remainingKm.toFixed(1)} km to goal`
                            : `Goal exceeded by ${(distanceKm - goalKm).toFixed(1)} km`}
                    </Text>
                </ColView>
                <View className="items-center justify-center">
                    <RingChart
                        pct={clampedPct}
                        radius={28}
                        strokeWidth={8}
                        strokeLinecap="round"
                        trackColor="rgba(128,128,128,0.08)"
                    />
                    <Text className="absolute text-[11px] font-medium text-foreground">
                        {clampedPct.toFixed(0)}
                        <Text className="text-[9px] text-muted-foreground">
                            %
                        </Text>
                    </Text>
                </View>
            </RowView>

            {/* ── Stats ── */}
            <RowView className="gap-2">
                {stats.map((stat) => (
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
