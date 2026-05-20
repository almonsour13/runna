import { ColView, RowView } from "@/shared/components/CustomView";
import ActivityGroupDrawer, {
    ActivityGroupDrawerHandle,
} from "@/shared/components/drawer/ActivityGroupDrawer";
import Card from "@/shared/components/ui/Card";
import Text from "@/shared/components/ui/Text";
import { ICON_COLORS } from "@/shared/constant/constant";
import { activityService } from "@/shared/services/storage/activity.service";
import { cn } from "@/shared/utils/cn";
import { computeStats } from "@/shared/utils/compute";
import { formatStats } from "@/shared/utils/format";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { useMemo, useRef } from "react";
import { TouchableOpacity } from "react-native";

export default function TodayActivity() {
    const activityGrouperDrawer = useRef<ActivityGroupDrawerHandle>(null);
    const today = useMemo(() => new Date(), []);
    const yesterday = useMemo(() => {
        const date = new Date();
        date.setDate(date.getDate() - 1);
        return date;
    }, []);
    const {
        data: activities = [],
        isLoading,
        error,
    } = useQuery({
        queryKey: ["home", "today"],
        queryFn: async () => {
            const data = await activityService.getByDate(today);
            return data;
        },
    });

    const { distance, calories, duration, goal, pace, speed } =
        computeStats(activities);
    const stats = formatStats({
        distance,
        duration,
        calories,
    });

    const hasActivities = activities.length > 0;

    return (
        <>
            <ColView className="">
                <RowView className="px-4 justify-between items-end">
                    <RowView className="gap-0">
                        <Text className="text-lg font-medium">Today</Text>
                        <Text className="text-lg text-muted-foreground font-medium">
                            {" "}
                            • {format(today, "MMM d, yyyy")}
                        </Text>
                    </RowView>
                    <TouchableOpacity
                        onPress={() =>
                            activityGrouperDrawer.current?.openWithActivityDate(
                                today,
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
                                    {stats.map((stat, i) => (
                                        <Card
                                            key={stat.label}
                                            className={cn("flex-1")}
                                        >
                                            <ColView className={cn("gap-1")}>
                                                <RowView className="gap-1">
                                                    <Ionicons
                                                        name={stat.icon as any}
                                                        size={11}
                                                        color={
                                                            ICON_COLORS[
                                                                stat.icon
                                                            ]
                                                        }
                                                    />
                                                    <Text className="text-xs text-muted-foreground">
                                                        {stat.label}
                                                    </Text>
                                                </RowView>
                                                <Text
                                                    className={cn(
                                                        "text-2xl font-bold",
                                                    )}
                                                >
                                                    {stat.value}{" "}
                                                    {stat.unit && (
                                                        <Text className="text-xs font-normal text-muted-foreground">
                                                            {stat.unit}
                                                        </Text>
                                                    )}
                                                </Text>
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
