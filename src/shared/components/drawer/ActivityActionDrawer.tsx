import { exportActivity } from "@/shared/services/export-activity.service";
import { activityService } from "@/shared/services/storage/activity.service";
import { useActivityStore } from "@/shared/stores/use-activity.store";
import { NavigationProp } from "@/shared/types/type";
import { useNavigation } from "@react-navigation/native";
import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import { Alert, TouchableOpacity } from "react-native";
import { cn } from "../../utils/cn";
import { ColView, RowView } from "../CustomView";
import Drawer, { DrawerHandle } from "../ui/Drawer";
import Text from "../ui/Text";

export type ActivityActionDrawerHandle = DrawerHandle & {
    openWithActivityId: (id: string) => void;
};
const ActivityActionDrawer = forwardRef<
    ActivityActionDrawerHandle,
    {
        onClose?: () => void;
    }
>(({ onClose }, ref) => {
    const navigation = useNavigation<NavigationProp>();
    const drawerRef = useRef<ActivityActionDrawerHandle>(null);
    const deleteActivity = useActivityStore((s) => s.deleteActivity);
    const [activityId, setActivityId] = useState("");

    useImperativeHandle(ref, () => ({
        open: () => drawerRef.current?.open(),
        close: () => drawerRef.current?.close(),
        openWithActivityId: (id: string) => {
            setActivityId(id);
            drawerRef.current?.open();
        },
    }));

    const CARD_ACTIONS = [
        {
            label: "View Details",
            onPress: () => {
                navigation.navigate("ActivityDetails", {
                    activityId,
                });
                drawerRef.current?.close();
            },
            visible: true,
        },
        {
            label: "Share",
            onPress: () => {},
            visible: false,
        },
        {
            label: "Export",
            onPress: () => {
                exportActivity(activityId);
                drawerRef.current?.close();
            },
            visible: false,
        },
        {
            label: "Delete",
            onPress: () => {
                Alert.alert(
                    "Delete Activity",
                    "Are you sure you want to delete this activity?",
                    [
                        {
                            text: "Cancel",
                            style: "cancel",
                        },
                        {
                            text: "Delete",
                            onPress: async () => {
                                deleteActivity(activityId);
                                activityService.delete(activityId);
                                drawerRef.current?.close();
                            },
                        },
                    ],
                );
            },
            danger: true,
            visible: true,
        },
    ];

    return (
        <>
            <Drawer ref={drawerRef}>
                <ColView className="gap-1 py-4">
                    {CARD_ACTIONS.filter((action) => action.visible).map(
                        (action) => {
                            return (
                                <TouchableOpacity
                                    key={action.label}
                                    onPress={() => action.onPress()}
                                    className={cn(
                                        "p-4 px-8 h-16 justify-center",
                                    )}
                                >
                                    <RowView className="justify-between">
                                        <Text
                                            className={cn(
                                                "text-lg",
                                                action.danger && "text-red-500",
                                            )}
                                        >
                                            {action.label}
                                        </Text>
                                    </RowView>
                                </TouchableOpacity>
                            );
                        },
                    )}
                </ColView>
            </Drawer>
        </>
    );
});

export default ActivityActionDrawer;
