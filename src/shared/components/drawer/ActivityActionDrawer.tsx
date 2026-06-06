import { useActivityMutations } from "@/shared/hooks/use-activity-mutation";
import { exportActivityById } from "@/shared/services/activity-export-import.service";
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
        hide_action?: string[];
        onClose?: (action?: string) => void;
    }
>(({ hide_action, onClose }, ref) => {
    const navigation = useNavigation<NavigationProp>();
    const drawerRef = useRef<ActivityActionDrawerHandle>(null);
    const [activityId, setActivityId] = useState("");
    const { deleteActivity } = useActivityMutations();

    useImperativeHandle(ref, () => ({
        open: () => drawerRef.current?.open(),
        close: () => {
            onClose?.();
            drawerRef.current?.close();
        },
        openWithActivityId: (id: string) => {
            setActivityId(id);
            drawerRef.current?.open();
        },
    }));

    const CARD_ACTIONS = [
        {
            label: "View Details",
            icon: "eye",
            onPress: () => {
                navigation.navigate("ActivityDetails", {
                    activityId,
                });
                drawerRef.current?.close();
            },
            visible: true,
        },
        {
            label: "Share Card",
            icon: "share-social",
            onPress: async () => {
                navigation.navigate("ActivityDetails", {
                    screen: "ActivityDetailsShareCardScreen",
                    activityId,
                });
                drawerRef.current?.close();
            },
            visible: true,
        },
        {
            label: "Export (Json)",
            icon: "download",
            onPress: async () => {
                await exportActivityById({ id: activityId });
            },
            visible: __DEV__,
        },
        {
            label: "Delete",
            icon: "trash",
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
                                deleteActivity.mutate(activityId, {
                                    onSuccess: () => {
                                        onClose?.();
                                        drawerRef.current?.close();
                                    },
                                });
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
                    {CARD_ACTIONS.filter(
                        (action) =>
                            action.visible &&
                            (!hide_action?.length ||
                                !hide_action.includes(
                                    action.label.toLowerCase(),
                                )),
                    ).map((action) => {
                        return (
                            <TouchableOpacity
                                key={action.label}
                                onPress={() => {
                                    action.onPress();
                                }}
                                className={cn(" px-8 h-14 justify-center")}
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
                    })}
                </ColView>
            </Drawer>
        </>
    );
});

export default ActivityActionDrawer;
