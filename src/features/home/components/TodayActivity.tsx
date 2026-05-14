import { ColView, RowView } from "@/shared/components/CustomView";
import ActivityGroupDrawer, {
    ActivityGroupDrawerHandle,
} from "@/shared/components/drawer/ActivityGroupDrawer";
import Card from "@/shared/components/ui/Card";
import Text from "@/shared/components/ui/Text";
import { useActivityStore } from "@/shared/stores/use-activity.store";
import { useProfileStore } from "@/shared/stores/use-profile.store";
import { NavigationProp } from "@/shared/types/type";
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
} from "@/shared/utils/format";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import { format } from "date-fns";
import { useMemo, useRef } from "react";
import { TouchableOpacity, View } from "react-native";

export default function TodayActivity() {
    const navigation = useNavigation<NavigationProp>();
    const isLoading = useActivityStore((s) => s.isLoading);
    const activities = useActivityStore((s) => s.activities);
    const profile = useProfileStore((s) => s.profile);
    const activityGrouperDrawer = useRef<ActivityGroupDrawerHandle>(null);

    const date = useMemo(() => new Date(), []);

    const {
        todayActivities,
        totalDistanceKm,
        totalGoalKm,
        goalCompletionPct,
        totalDurationSec,
        averageSpeed,
        averagePace,
        totalCalories,
    } = useMemo(() => {
        const todayActivities = activities.filter(
            (activity) =>
                new Date(activity.createdAt).toDateString() ===
                date.toDateString(),
        );

        const totalDistanceMeters = todayActivities.reduce(
            (sum, activity) =>
                sum + computeTotalDistance(activity.coordinates || []),
            0,
        );

        const totalDistanceKm = convertMtoKm(totalDistanceMeters);

        const totalDurationSec = todayActivities.reduce(
            (sum, activity) => sum + convertMsToS(activity.duration),
            0,
        );

        const totalGoalMeters = todayActivities.reduce(
            (sum, activity) => sum + activity.goal,
            0,
        );

        const totalGoalKm = convertMtoKm(totalGoalMeters);

        const goalCompletionPct =
            totalGoalKm > 0
                ? (Number(totalDistanceKm) / Number(totalGoalKm)) * 100
                : 0;

        return {
            todayActivities,

            totalDistanceKm,
            totalGoalKm,
            goalCompletionPct,

            totalDurationSec,

            averageSpeed: computeSpeed(totalDistanceMeters, totalDurationSec),

            averagePace: computePace(totalDistanceMeters, totalDurationSec),

            totalCalories: computeCalories(
                totalDistanceMeters,
                profile?.weight ?? 70,
            ),
        };
    }, [activities, date, profile]);

    const isGoalReached = goalCompletionPct >= 100;

    const remainingDistanceKm = Math.max(
        Number(totalGoalKm) - Number(totalDistanceKm),
        0,
    );

    const stats = [
        {
            label: "Distance",
            value: totalDistanceKm.toFixed(1),
            unit: "km",
            icon: "navigate-outline",
            visible: true,
        },
        {
            label: "Duration",
            value: formatDuration(totalDurationSec),
            unit: "hh:mm",
            icon: "time-outline",
            visible: true,
        },
        {
            label: "Calories",
            value: formatCalories(totalCalories),
            unit: "kcal",
            icon: "flame-outline",
            visible: true,
        },
        {
            label: "Pace",
            value: formatPace(averagePace),
            unit: "min/km",
            icon: "timer-outline",
            visible: false,
        },
    ];

    const hasActivities = todayActivities.length > 0;

    return (
        <>
            <ColView className="">
                <RowView className="px-4 justify-between items-end">
                    <RowView className="gap-0">
                        <Text className="text-lg font-medium">Today</Text>
                        <Text className="text-lg text-muted-foreground font-medium">
                            {" "}
                            • {format(date, "MMM d, yyyy")}
                        </Text>
                    </RowView>
                    <TouchableOpacity
                        onPress={() =>
                            activityGrouperDrawer.current?.openWithActivityDate(
                                date.toDateString(),
                            )
                        }
                    >
                        {hasActivities && (
                            <Text className="text-base text-primary font-medium">
                                {todayActivities.length}{" "}
                                {todayActivities.length === 1
                                    ? "Activity"
                                    : "Activities"}
                            </Text>
                        )}
                    </TouchableOpacity>
                </RowView>
                <ColView className="px-4 gap-1">
                    {isLoading ? (
                        <Card className="h-32" />
                    ) : (
                        <Card className="p-0 bg-transparent">
                            <ColView className="gap-4">
                                <RowView className="justify-between gap-1">
                                    {stats
                                        .filter((stat) => stat.visible)
                                        .map((stat, i) => (
                                            <Card
                                                key={stat.label}
                                                className={cn("flex-1")}
                                            >
                                                <ColView
                                                    className={cn("gap-1")}
                                                >
                                                    <RowView className="gap-1 items-center">
                                                        <Ionicons
                                                            name={
                                                                stat.icon as any
                                                            }
                                                            size={11}
                                                            className="text-primary"
                                                        />
                                                        <Text className="text-xs text-muted-foreground">
                                                            {stat.label}
                                                        </Text>
                                                    </RowView>
                                                    <ColView className="gap-0">
                                                        <Text className="text-2xl font-semibold text-foreground">
                                                            {stat.value}
                                                        </Text>
                                                        {stat.unit && (
                                                            <Text className="text-[8px] font-normal text-muted-foreground">
                                                                {stat.unit}
                                                            </Text>
                                                        )}
                                                    </ColView>
                                                </ColView>
                                            </Card>
                                        ))}
                                </RowView>
                                <ColView className="hidden gap-2">
                                    <View className="h-1 bg-muted rounded-full overflow-hidden">
                                        <View
                                            style={{
                                                width: `${goalCompletionPct}%`,
                                            }}
                                            className="h-1 bg-primary rounded"
                                        />
                                    </View>
                                    <RowView className="justify-between">
                                        <Text className="text-xs">
                                            {totalDistanceKm.toFixed(1)}km
                                        </Text>
                                        <Text className="text-xs">
                                            {goalCompletionPct.toFixed(0)}%
                                        </Text>
                                        <Text className="text-xs">
                                            {totalGoalKm}km
                                        </Text>
                                    </RowView>
                                </ColView>
                            </ColView>
                        </Card>
                    )}
                </ColView>
            </ColView>
            <ActivityGroupDrawer ref={activityGrouperDrawer} />
        </>
    );
}
