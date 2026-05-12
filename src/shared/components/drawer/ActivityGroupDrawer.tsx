import { useActivityStore } from "@/shared/stores/use-activity.store";
import { NavigationProp } from "@/shared/types/type";
import { formatRelativeDateLabel } from "@/shared/utils/format";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { format } from "date-fns";
import {
    forwardRef,
    useImperativeHandle,
    useMemo,
    useRef,
    useState,
} from "react";
import ActivityCard from "../ActivityCard";
import { ColView, RowView } from "../CustomView";
import Drawer, { DrawerHandle } from "../ui/Drawer";
import Text from "../ui/Text";

export type ActivityGroupDrawerHandle = DrawerHandle & {
    openWithActivityDate: (date: string) => void;
};
const ActivityGroupDrawer = forwardRef<
    ActivityGroupDrawerHandle,
    {
        onClose?: () => void;
    }
>(({ onClose }, ref) => {
    const navigation = useNavigation<NavigationProp>();
    const drawerRef = useRef<ActivityGroupDrawerHandle>(null);
    const deleteActivity = useActivityStore((s) => s.deleteActivity);
    const [activityDate, setActivityDate] = useState("");
    const activities = useActivityStore((s) => s.activities);

    useImperativeHandle(ref, () => ({
        open: () => drawerRef.current?.open(),
        close: () => drawerRef.current?.close(),
        openWithActivityDate: (date: string) => {
            setActivityDate(date);
            drawerRef.current?.open();
        },
    }));

    const { activityGroupActivities } = useMemo(() => {
        const activityGroupActivities = activities.filter(
            (a) =>
                new Date(a.createdAt).toDateString() ===
                new Date(activityDate).toDateString(),
        );
        return {
            activityGroupActivities,
        };
    }, [activityDate, activities]);
    const hasActivities = activityGroupActivities.length > 0;
    const activityDateObj = new Date(activityDate);

    if (!hasActivities) {
        return (
            <Drawer ref={drawerRef}>
                <ColView className="items-center justify-center gap-3 px-4 py-16">
                    <Ionicons
                        name="footsteps-outline"
                        size={32}
                        className="text-muted-foreground"
                    />
                    <ColView className="items-center gap-1">
                        <Text className="text-sm font-medium text-foreground">
                            No Activities
                        </Text>
                        <Text className="text-xs text-muted-foreground text-center">
                            Activities for this day will appear here.
                        </Text>
                    </ColView>
                </ColView>
            </Drawer>
        );
    }
    const dateLabel = [
        formatRelativeDateLabel(activityDateObj),
        format(activityDateObj, "EEE"),
        format(activityDateObj, "MMM d, yyy"),
    ]
        .filter(Boolean)
        .join(" • ");
    return (
        <>
            <Drawer ref={drawerRef}>
                <ColView className="gap-1 py-4">
                    <ColView className="px-4 gap-2">
                        <RowView className="justify-between items-end">
                            <RowView className="gap-0">
                                <Text className="text-lg font-medium">
                                    {dateLabel}
                                </Text>
                            </RowView>
                            <Text className="text-base text-primary font-medium">
                                {activityGroupActivities.length}{" "}
                                {activityGroupActivities.length === 1
                                    ? "Activity"
                                    : "Activities"}
                            </Text>
                        </RowView>
                        {activityGroupActivities.map((activity) => (
                            <ActivityCard
                                key={activity.id}
                                activity={activity}
                                className="border border-border/40"
                            />
                        ))}
                    </ColView>
                </ColView>
            </Drawer>
        </>
    );
});

export default ActivityGroupDrawer;
