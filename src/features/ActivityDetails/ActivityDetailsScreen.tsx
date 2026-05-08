import { ColView, RowView } from "@/shared/components/CustomView";
import RouteMap from "@/shared/components/RouteMap";
import SafeScreen from "@/shared/components/SafeScreen";
import RingChart from "@/shared/components/ui/RingChart";
import Text from "@/shared/components/ui/Text";
import { useActivityStore } from "@/shared/stores/use-activity.store";
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
import { logger } from "@/shared/utils/logger";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { format, isToday, isYesterday } from "date-fns";
import { useMemo } from "react";
import { ScrollView, TouchableOpacity, View } from "react-native";
import ActivityDetailsEmptyState from "./Components/ActivityDetailsEmptyState";

export default function ActivityDetailsScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const profile = useProfileStore((s) => s.profile);
    const { activityId } = route.params as { activityId: string };

    const activity = useActivityStore((s) =>
        s.activities.find((a) => a.id === activityId),
    );

    if (!activity) return <ActivityDetailsEmptyState />;

    const { dateLabel, startTime, endTime, distanceKm, goalKm, pct, stats } =
        useMemo(() => {
            logger.log("activity", activity);
            const dateLabel = isToday(activity.startTime)
                ? "Today"
                : isYesterday(activity.startTime)
                  ? "Yesterday"
                  : format(activity.startTime, "EEEE, MMM d yyyy");

            const startTime = format(activity.startTime, "h:mm a");
            const endTime = activity.endTime
                ? format(activity.endTime, "h:mm a")
                : "Ongoing";

            const distance = computeTotalDistance(activity.coordinates);
            const distanceKm = Number(convertMtoKm(distance));
            const goalKm = Number(convertMtoKm(activity.goal));
            const pct =
                goalKm > 0 ? Math.min((distanceKm / goalKm) * 100, 100) : 0;
            const durationSec = convertMsToS(activity.duration);

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
                        computeCalories(distance, profile?.weight ?? 70),
                    ),
                    unit: "kcal",
                    icon: "flame-outline" as const,
                },
                {
                    label: "Pace",
                    value: formatPace(computePace(distance, durationSec)),
                    unit: "min/km",
                    icon: "timer-outline" as const,
                },
                {
                    label: "Speed",
                    value: formatSpeed(computeSpeed(distance, durationSec)),
                    unit: "km/h",
                    icon: "speedometer-outline" as const,
                },
            ];

            return {
                dateLabel,
                startTime,
                endTime,
                distanceKm,
                goalKm,
                pct,
                stats,
            };
        }, [activity, profile?.weight]);

    return (
        <SafeScreen>
            <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                <ColView className="flex-1 gap-8">
                    <RowView className="px-4 pt-4 gap-2 items-center">
                        <RowView className="flex-1 gap-4 items-center">
                            <TouchableOpacity
                                onPress={() => navigation.goBack()}
                            >
                                <Ionicons name="arrow-back" size={24} />
                            </TouchableOpacity>
                            <ColView className="gap-0">
                                <Text className="text-lg font-medium">
                                    {dateLabel}
                                </Text>
                                <Text className="text-xs text-muted-foreground">
                                    {startTime} – {endTime}
                                </Text>
                            </ColView>
                        </RowView>
                        <RowView>
                            <Ionicons name="share-social" size={24} />
                        </RowView>
                    </RowView>

                    <ColView className="px-4">
                        <RouteMap
                            coordinates={activity.coordinates}
                            type={activity.type}
                            strokeWidth={4}
                        />
                    </ColView>

                    <ColView className="flex-1 p-4 pt-8 gap-8">
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
                            </ColView>
                            <View className="items-center justify-center">
                                <RingChart
                                    pct={pct}
                                    radius={28}
                                    strokeWidth={8}
                                    strokeLinecap="round"
                                    trackColor="rgba(128,128,128,0.08)"
                                />
                                <Text className="absolute text-[11px] font-medium text-foreground">
                                    {pct.toFixed(0)}
                                    <Text className="text-[9px] text-muted-foreground">
                                        %
                                    </Text>
                                </Text>
                            </View>
                        </RowView>

                        <RowView className="gap-2">
                            {stats.map((stat) => (
                                <ColView
                                    key={stat.label}
                                    className="flex-1 gap-1"
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
                </ColView>
            </ScrollView>
        </SafeScreen>
    );
}
