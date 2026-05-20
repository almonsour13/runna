import { activityService } from "@/shared/services/storage/activity.service";
import { cn } from "@/shared/utils/cn";
import { computeStats } from "@/shared/utils/compute";
import { formatRelativeDateLabel, formatStats } from "@/shared/utils/format";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import ActivityCard from "../ActivityCard";
import { ColView, RowView } from "../CustomView";
import Card from "../ui/Card";
import Drawer, { DrawerHandle } from "../ui/Drawer";
import Text from "../ui/Text";

export type ActivityGroupDrawerHandle = DrawerHandle & {
    openWithActivityDate: (date: Date) => void;
};
const ActivityGroupDrawer = forwardRef<
    ActivityGroupDrawerHandle,
    {
        onClose?: () => void;
    }
>(({ onClose }, ref) => {
    const drawerRef = useRef<ActivityGroupDrawerHandle>(null);
    const [activityDate, setActivityDate] = useState<Date | null>(null);

    useImperativeHandle(ref, () => ({
        open: () => drawerRef.current?.open(),
        close: () => drawerRef.current?.close(),
        openWithActivityDate: (date: Date) => {
            setActivityDate(date);
            drawerRef.current?.open();
        },
    }));

    const { data: activities = [], isLoading } = useQuery({
        queryKey: ["activities", activityDate?.toDateString()],
        queryFn: async () => {
            if (!activityDate) return [];
            return activityService.getByDate(activityDate);
        },
        enabled: !!activityDate,
        staleTime: 0,
    });

    const isEmpty = !isLoading && activityDate && activities.length === 0;

    const dateLabel =
        activityDate &&
        [
            formatRelativeDateLabel(activityDate),
            format(activityDate, "EEE"),
            format(activityDate, "MMM d, yyy"),
        ]
            .filter(Boolean)
            .join(" • ");

    const { distance, calories, duration, goal, pace, speed } =
        computeStats(activities);
    const stats = formatStats({
        distance,
        duration,
        calories,
    });
    return (
        <>
            <Drawer ref={drawerRef}>
                {isLoading ? (
                    <ColView className="items-center justify-center gap-3 px-4 py-16">
                        <Ionicons
                            name="sync"
                            size={32}
                            className="text-muted-foreground"
                        />
                        <Text className="text-sm font-medium">Loading...</Text>
                    </ColView>
                ) : isEmpty ? (
                    <ColView className="items-center justify-center gap-3 px-4 py-16">
                        <Ionicons
                            name="footsteps-outline"
                            size={32}
                            className="text-muted-foreground"
                        />
                        <ColView className="items-center gap-1">
                            <Text className="text-sm font-medium">
                                No Activities
                            </Text>
                            <Text className="text-xs text-muted-foreground text-center">
                                Activities for this day will appear here.
                            </Text>
                        </ColView>
                    </ColView>
                ) : (
                    <ColView className="px-4 gap-2 py-4">
                        <RowView className="justify-between items-end">
                            <RowView className="gap-0">
                                <Text className="text-lg font-medium">
                                    {dateLabel}
                                </Text>
                            </RowView>
                            <Text className="text-base text-primary font-medium">
                                {activities.length}{" "}
                                {activities.length === 1
                                    ? "Activity"
                                    : "Activities"}
                            </Text>
                        </RowView>

                        <RowView className="justify-between gap-1">
                            {stats.map((stat, i) => (
                                <Card
                                    key={stat.label}
                                    className={cn(
                                        "flex-1",
                                        "border border-border/40",
                                    )}
                                >
                                    <ColView className={cn("gap-1")}>
                                        <RowView className="gap-1">
                                            <Ionicons
                                                name={stat.icon as any}
                                                size={11}
                                                className="text-primary"
                                            />
                                            <Text className="text-xs text-muted-foreground">
                                                {stat.label}
                                            </Text>
                                        </RowView>
                                        <Text
                                            className={cn("text-3xl font-bold")}
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
                        <ColView>
                            <Text className="text-lg text-foreground font-medium">
                                Activities
                            </Text>
                            <ColView className="gap-1">
                                {activities.map((activity) => (
                                    <ActivityCard
                                        key={activity.id}
                                        activity={activity}
                                        className="border border-border/40"
                                    />
                                ))}
                            </ColView>
                        </ColView>
                    </ColView>
                )}
            </Drawer>
        </>
    );
});

export default ActivityGroupDrawer;
