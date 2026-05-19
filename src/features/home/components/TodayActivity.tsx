import { ColView, RowView } from "@/shared/components/CustomView";
import ActivityGroupDrawer, {
    ActivityGroupDrawerHandle,
} from "@/shared/components/drawer/ActivityGroupDrawer";
import Card from "@/shared/components/ui/Card";
import Text from "@/shared/components/ui/Text";
import { homeService } from "@/shared/services/storage/home.service";
import { cn } from "@/shared/utils/cn";
import { convertMsToS, convertMtoKm } from "@/shared/utils/convert";
import { formatCalories, formatDuration } from "@/shared/utils/format";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { useMemo, useRef } from "react";
import { TouchableOpacity } from "react-native";

export default function TodayActivity() {
    const activityGrouperDrawer = useRef<ActivityGroupDrawerHandle>(null);
    const {
        data: activities = [],
        isLoading,
        error,
    } = useQuery({
        queryKey: ["home", "today"],
        queryFn: async () => {
            const data = await homeService.getTodayActivity();
            return data;
        },
    });

    const date = useMemo(() => new Date(), []);

    const { distanceKm, durationSec, calories } = useMemo(() => {
        const distance = activities.reduce(
            (sum, activity) => sum + activity.distance,
            0,
        );
        const calories = activities.reduce(
            (sum, activity) => sum + activity.calories,
            0,
        );
        const duration = activities.reduce(
            (sum, activity) => sum + activity.duration,
            0,
        );
        const goal = activities.reduce(
            (sum, activity) => sum + activity.goal,
            0,
        );
        const pace = activities.reduce(
            (sum, activity) => sum + activity.avgPace,
            0,
        );
        const speed = activities.reduce(
            (sum, activity) => sum + activity.avgSpeed,
            0,
        );

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
    }, [activities]);

    const stats = [
        {
            label: "Distance",
            value: distanceKm.toFixed(1),
            unit: "km",
            icon: "navigate-outline",
            visible: true,
        },
        {
            label: "Duration",
            value: formatDuration(durationSec),
            unit: "hh:mm",
            icon: "time-outline",
            visible: true,
        },
        {
            label: "Calories",
            value: formatCalories(calories),
            unit: "kcal",
            icon: "flame-outline",
            visible: true,
        },
        {
            label: "Pace",
            value: "asd",
            unit: "min/km",
            icon: "timer-outline",
            visible: false,
        },
    ];

    const hasActivities = activities.length > 0;

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
                                date,
                            )
                        }
                    >
                        {hasActivities && (
                            <Text className="text-base text-primary font-medium">
                                {activities.length}{" "}
                                {activities.length === 1
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
                            </ColView>
                        </Card>
                    )}
                </ColView>
            </ColView>
            <ActivityGroupDrawer ref={activityGrouperDrawer} />
        </>
    );
}
