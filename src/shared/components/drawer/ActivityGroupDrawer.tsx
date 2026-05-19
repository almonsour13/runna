import { activityService } from "@/shared/services/storage/activity.service";
import { formatRelativeDateLabel } from "@/shared/utils/format";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import ActivityCard from "../ActivityCard";
import { ColView, RowView } from "../CustomView";
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
    const {
        data: activities = [],
        isLoading,
        error,
    } = useQuery({
        queryKey: ["activities", activityDate],
        queryFn: async () => {
            if (!activityDate) return [];
            const data = await activityService.getByDate(activityDate);
            return data;
        },
        enabled: !!activityDate,
    });

    const isEmpty = activityDate && activities.length === 0;

    const dateLabel =
        activityDate &&
        [
            formatRelativeDateLabel(activityDate),
            format(activityDate, "EEE"),
            format(activityDate, "MMM d, yyy"),
        ]
            .filter(Boolean)
            .join(" • ");
    return (
        <>
            <Drawer ref={drawerRef}>
                {isEmpty ? (
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
                    <ColView className="gap-1 py-4">
                        <ColView className="px-4 gap-2">
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
