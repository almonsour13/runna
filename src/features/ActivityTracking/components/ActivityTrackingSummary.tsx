import { ColView, RowView } from "@/shared/components/CustomView";
import Text from "@/shared/components/ui/Text";
import { useActivityTrackingStore } from "@/shared/stores/use-activity-tracking.store";
import { useProfileStore } from "@/shared/stores/use-profile.store";
import {
    computeCalories,
    computePace,
    computeTotalDistance,
} from "@/shared/utils/compute";
import { convertMsToS, convertMtoKm } from "@/shared/utils/convert";
import {
    formatCalories,
    formatDurationHHMMSS,
    formatPace,
} from "@/shared/utils/format";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useMemo } from "react";

export default function ActivityTrackingSummary() {
    const profile = useProfileStore((s) => s.profile);
    const activity = useActivityTrackingStore((s) => s.activity);
    const duration = activity.duration;
    const coordinates = activity.coordinates;

    const goal = profile?.goal || 0;

    const time = formatDurationHHMMSS(duration);

    const { stats } = useMemo(() => {
        const distance = computeTotalDistance(coordinates);
        const distanceKm = convertMtoKm(distance);
        const calories = formatCalories(
            computeCalories(distance, profile?.weight ?? 70),
        );
        const durationSec = convertMsToS(duration);
        const pace = formatPace(computePace(distance, convertMsToS(duration)));
        const pct = Math.min((distanceKm / goal) * 100, 100) || 0;
        const stats = [
            {
                label: "Distance",
                value: distanceKm.toFixed(1),
                unit: "km",
                icon: "location-outline" as const,
            },
            {
                label: "Calories",
                value: calories,
                unit: "kcal",
                icon: "flame-outline" as const,
            },
            {
                label: "Pace",
                value: pace,
                unit: "min/km",
                icon: "timer-outline" as const,
            },
        ];
        return { stats };
    }, [coordinates, duration, profile?.weight]);

    return (
        <ColView className="flex-1 p-4 gap-4 justify-center items-center">
            <RowView className="justify-center items-center">
                <ColView className="gap-1 items-center">
                    <RowView className="gap-1 items-center">
                        <Ionicons
                            name="time-outline"
                            size={12}
                            className="text-primary"
                        />
                        <Text className="text-sm text-muted-foreground">
                            Duration {coordinates.length}
                        </Text>
                    </RowView>
                    <Text className="text-7xl font-bold">{time}</Text>
                </ColView>
            </RowView>
            <RowView>
                {stats.map((stat, i) => (
                    <ColView
                        key={stat.label}
                        className="flex-1 gap-1 justify-center items-center"
                    >
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
                        <Text className="text-4xl font-medium">
                            {stat.value}
                        </Text>
                        {stat.unit && (
                            <Text className="text-[8px] font-medium text-muted-foreground">
                                {stat.unit}
                            </Text>
                        )}
                    </ColView>
                ))}
            </RowView>
        </ColView>
    );
}
