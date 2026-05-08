import { ColView, RowView } from "@/shared/components/CustomView";
import Card from "@/shared/components/ui/Card";
import RingChart from "@/shared/components/ui/RingChart";
import Text from "@/shared/components/ui/Text";
import { useActivityStore } from "@/shared/stores/use-activity.store";
import { useProfileStore } from "@/shared/stores/use-profile.store";
import { NavigationProp } from "@/shared/types/type";
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
import { useNavigation } from "@react-navigation/native";
import { format } from "date-fns";
import { useMemo } from "react";
import { TouchableOpacity, View } from "react-native";

export default function TodayActivity() {
    const navigation = useNavigation<NavigationProp>();
    const activities = useActivityStore((s) => s.activities);
    const profile = useProfileStore((s) => s.profile);

    const date = new Date();
    const {
        todayActivities,
        distanceKm,
        goalKm,
        pct,
        durationSec,
        avgSpeed,
        avgPace,
        calories,
    } = useMemo(() => {
        const todayActivities = activities.filter(
            (a) => new Date(a.createdAt).toDateString() === date.toDateString(),
        );
        const distance = todayActivities.reduce(
            (acc, activity) => acc + computeTotalDistance(activity.coordinates),
            0,
        );
        const distanceKm = convertMtoKm(distance);
        const durationSec = todayActivities.reduce(
            (acc, activity) => acc + convertMsToS(activity.duration),
            0,
        );
        const goalKm = convertMtoKm(
            todayActivities.reduce((acc, activity) => acc + activity.goal, 0),
        );
        const pct = (Number(distanceKm) / Number(goalKm)) * 100 || 0;

        return {
            todayActivities,
            distanceKm,
            goalKm,
            pct,
            durationSec,
            avgSpeed: computeSpeed(distance, durationSec),
            avgPace: computePace(distance, durationSec),
            calories: computeCalories(distance, profile?.weight || 70),
        };
    }, [activities]);

    const goalReached = pct >= 100;
    const remainingKm = Math.max(Number(goalKm) - Number(distanceKm), 0);

    const stats = [
        {
            label: "Duration",
            value: formatDuration(durationSec),
            unit: "hh:mm",
            icon: "time-outline",
        },
        {
            label: "Calories",
            value: formatCalories(calories),
            unit: "kcal",
            icon: "flame-outline",
        },
        {
            label: "Avg. Pace",
            value: formatPace(avgPace),
            unit: "min/km",
            icon: "timer-outline",
        },
        {
            label: "Speed",
            value: formatSpeed(avgSpeed),
            unit: "km/h",
            icon: "speedometer-outline",
        },
    ];
    return (
        <ColView>
            <RowView className="px-4 justify-between items-end">
                <RowView>
                    <Text className="text-lg font-medium">Today</Text>
                    <Text className="text-lg text-muted-foreground font-medium">
                        • {format(date, "MMM d, yyyy")}
                    </Text>
                </RowView>
                <TouchableOpacity
                    onPress={() =>
                        navigation.navigate("History", {
                            initialFilter: "Today",
                        })
                    }
                >
                    <Text className="text-base text-primary font-medium">
                        {todayActivities.length}{" "}
                        {todayActivities.length === 1 ? "Session" : "Sessions"}
                    </Text>
                </TouchableOpacity>
            </RowView>
            <ColView className="px-4 gap-1">
                <Card className="">
                    <ColView className="gap-2">
                        <ColView className="gap-4">
                            <RowView className="justify-between items-center">
                                <ColView className="gap-1">
                                    <View>
                                        <Text
                                            className={`text-[10px] font-medium ${
                                                goalReached
                                                    ? "text-primary"
                                                    : "text-foreground"
                                            }`}
                                        >
                                            {goalReached
                                                ? "Goal complete"
                                                : `${pct.toFixed(0)}% of goal`}
                                        </Text>
                                    </View>

                                    <RowView className="items-baseline gap-1.5">
                                        <Text className="text-4xl font-medium text-foreground">
                                            {distanceKm.toFixed(1)}
                                        </Text>
                                        <Text className="text-base text-muted-foreground">
                                            / {goalKm.toFixed(1)} km
                                        </Text>
                                    </RowView>

                                    <Text className="text-xs text-muted-foreground">
                                        {remainingKm > 0
                                            ? `${remainingKm.toFixed(1)} km remaining`
                                            : `Exceeded by ${(Number(distanceKm) - Number(goalKm)).toFixed(1)} km`}
                                    </Text>
                                </ColView>

                                {/* Ring */}
                                <View className="items-center justify-center">
                                    <RingChart
                                        pct={pct}
                                        radius={28}
                                        strokeWidth={6}
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
                            <View className="border-b border-border/40" />
                            <RowView>
                                {stats.map((stat, i) => (
                                    <ColView
                                        key={stat.label}
                                        className={
                                            i > 0
                                                ? "flex-1 pl-4 border-l border-border/40 gap-1"
                                                : "flex-1 gap-1"
                                        }
                                    >
                                        <RowView className="gap-1 items-center">
                                            <Ionicons
                                                name={stat.icon as any}
                                                size={11}
                                                className="text-primary"
                                            />
                                            <Text className="text-xs text-muted-foreground">
                                                {stat.label}
                                            </Text>
                                        </RowView>
                                        <ColView className="gap-0">
                                            <Text className="text-xl font-medium text-foreground">
                                                {stat.value}
                                            </Text>
                                            {stat.unit && (
                                                <Text className="text-[8px] font-normal text-muted-foreground">
                                                    {stat.unit}
                                                </Text>
                                            )}
                                        </ColView>
                                    </ColView>
                                ))}
                            </RowView>
                        </ColView>
                    </ColView>
                </Card>
            </ColView>
        </ColView>
    );
}
