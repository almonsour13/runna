import { ColView, RowView } from "@/shared/components/CustomView";
import GoalDrawer from "@/shared/components/drawer/GoalDrawer";
import Card from "@/shared/components/ui/Card";
import { DrawerHandle } from "@/shared/components/ui/Drawer";
import Text from "@/shared/components/ui/Text";
import { useActivityTrackingStore } from "@/shared/stores/use-activity-tracking.store";
import { useProfileStore } from "@/shared/stores/use-profile.store";
import { cn } from "@/shared/utils/cn";
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
import { useMemo, useRef } from "react";
import { TouchableOpacity } from "react-native";

export default function ActivityTrackingSummary() {
    const profile = useProfileStore((s) => s.profile);
    const goal = profile?.goal || 0;
    const setField = useProfileStore((s) => s.setField);
    const duration = useActivityTrackingStore((s) => s.duration);
    const coordinates = useActivityTrackingStore((s) => s.coordinates);
    const time = formatDurationHHMMSS(duration);
    const goalDrawerRef = useRef<DrawerHandle>(null);

    const { stats } = useMemo(() => {
        const distance = computeTotalDistance(coordinates);
        const distanceKm = convertMtoKm(distance);
        const calories = formatCalories(
            computeCalories(distance, profile?.weight ?? 70),
        );
        const durationSec = convertMsToS(duration);
        const pace =
            distanceKm > 0.01
                ? formatPace(computePace(distance, convertMsToS(duration)))
                : "00:00";
        const stats = [
            {
                label: "Distance",
                value: distanceKm.toFixed(2).padStart(2, "0"),
                unit: "km",
                icon: "location-outline" as const,
                color: "text-blue-500",
            },
            {
                label: "Calories",
                value: calories,
                unit: "kcal",
                icon: "flame-outline" as const,
                color: "text-orange-500",
            },
            {
                label: "Pace",
                value: pace,
                unit: "/km",
                icon: "timer-outline" as const,
                color: "text-purple-500",
            },
        ];
        return { stats };
    }, [coordinates, duration, profile?.weight]);

    return (
        <>
            <ColView
                className={cn("flex-1 px-4 gap-4 justify-center items-center")}
            >
                <RowView className="gap-4 items-center">
                    <TouchableOpacity
                        onPress={() => goalDrawerRef.current?.open()}
                    >
                        <Card className="px-3 py-1.5">
                            <RowView className="gap-1.5">
                                <Ionicons
                                    name="flag"
                                    size={12}
                                    className="text-primary"
                                />
                                <Text className="text-xs ">
                                    {convertMtoKm(goal)} km
                                </Text>
                            </RowView>
                        </Card>
                    </TouchableOpacity>
                </RowView>
                <ColView className="gap-1 items-center">
                    <Text className="text-6xl font-bold">{time}</Text>
                    <RowView className="gap-1 items-center">
                        <Ionicons
                            name="time-outline"
                            size={12}
                            className="hidden text-primary"
                        />
                        <Text className="text-xs text-muted-foreground">
                            Duration
                        </Text>
                    </RowView>
                </ColView>
                <RowView className="w-full justify-between">
                    {stats.map((stat, i) => (
                        <ColView
                            key={stat.label}
                            className="gap-1 items-center"
                        >
                            <RowView className="items-end">
                                <Text className="text-3xl leading-4 font-medium ">
                                    {stat.value}
                                </Text>
                            </RowView>
                            <RowView className="gap-1 items-center">
                                <Ionicons
                                    name={stat.icon}
                                    size={12}
                                    className="hidden text-primary"
                                />
                                <Text className="text-xs text-muted-foreground">
                                    {stat.label} (
                                    {stat.unit && (
                                        <Text className=" text-xs font-medium text-muted-foreground">
                                            {stat.unit}
                                        </Text>
                                    )}
                                    )
                                </Text>
                            </RowView>
                        </ColView>
                    ))}
                </RowView>
            </ColView>

            <GoalDrawer
                ref={goalDrawerRef}
                value={goal}
                onChange={(v) => {
                    setField("goal", v);
                }}
            />
        </>
    );
}
