import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import { Alert, TouchableOpacity } from "react-native";
import { ColView, RowView } from "../../../shared/components/CustomView";
import Drawer, { DrawerHandle } from "../../../shared/components/ui/Drawer";
import Text from "../../../shared/components/ui/Text";
import { cn } from "../../../shared/utils/cn";
import { useScheduleMutations } from "../hooks/use-schedule-mutation";
import ScheduleFormDrawer, {
    ScheduleFormDrawerHandle,
} from "./ScheduleFormDrawer";

export type ScheduleActionDrawerHandle = DrawerHandle & {
    openWithScheduleId: (id: string) => void;
};
const ScheduleActionDrawer = forwardRef<
    ScheduleActionDrawerHandle,
    {
        hide_action?: string[];
        onClose?: () => void;
    }
>(({ hide_action, onClose }, ref) => {
    const scheduleFormDrawer = useRef<ScheduleFormDrawerHandle>(null);
    const drawerRef = useRef<ScheduleActionDrawerHandle>(null);
    const [scheduleId, setScheduleId] = useState("");
    const { deleteSchedule } = useScheduleMutations();
    useImperativeHandle(ref, () => ({
        open: () => drawerRef.current?.open(),
        close: () => drawerRef.current?.close(),
        openWithScheduleId: (id: string) => {
            setScheduleId(id);
            drawerRef.current?.open();
        },
    }));

    const CARD_ACTIONS = [
        {
            label: "Edit",
            icon: "pencil",
            onPress: () => {
                scheduleFormDrawer.current?.openWithScheduleId(scheduleId);
                drawerRef.current?.close();
            },
            visible: true,
        },
        {
            label: "Delete",
            icon: "trash",
            onPress: () => {
                Alert.alert(
                    "Delete Schedule",
                    "Are you sure you want to delete this schedule?",
                    [
                        {
                            text: "Cancel",
                            style: "cancel",
                        },
                        {
                            text: "Delete",
                            onPress: async () => {
                                deleteSchedule.mutateAsync(scheduleId);
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
            <ScheduleFormDrawer ref={scheduleFormDrawer} />
        </>
    );
});

export default ScheduleActionDrawer;
