import { useQuery } from "@tanstack/react-query";
import {
    forwardRef,
    useEffect,
    useImperativeHandle,
    useRef,
    useState,
} from "react";

import { scheduleService } from "@/shared/services/storage/schedule.service";
import { Schedule } from "@/shared/types/type";

import ActivityTypeDrawer from "@/shared/components/drawer/ActivityTypeDrawer";
import GoalDrawer from "@/shared/components/drawer/GoalDrawer";
import { cn } from "@/shared/utils/cn";
import { convertMtoKm } from "@/shared/utils/convert";
import { generateId } from "@/shared/utils/utils";
import { format } from "date-fns";
import { Switch, TextInput, TouchableOpacity } from "react-native";
import { ColView, RowView } from "../../../shared/components/CustomView";
import Card from "../../../shared/components/ui/Card";
import Drawer, { DrawerHandle } from "../../../shared/components/ui/Drawer";
import Text from "../../../shared/components/ui/Text";
import { useScheduleMutations } from "../hooks/use-schedule-mutation";
import RepeatDaysDrawer from "./RepeatDaysDrawer";
import RepeatTypeDrawer from "./RepeatTypeDrawer";
import TimeDrawer from "./TimeDrawerRef";

export type ScheduleFormDrawerHandle = DrawerHandle & {
    openWithScheduleId: (id: string) => void;
};

const EMPTY_SCHEDULE = (): Schedule => ({
    id: generateId(),
    title: "",
    description: null,
    time: "",
    goal: 0,
    type: "",
    repeatDays: "[]",
    status: "active",
    createdAt: new Date(),
    updatedAt: new Date(),
});
const ScheduleFormDrawer = forwardRef<
    ScheduleFormDrawerHandle,
    {
        onClose?: () => void;
    }
>(({ onClose }, ref) => {
    const drawerRef = useRef<DrawerHandle>(null);
    const { createSchedule, updateSchedule } = useScheduleMutations();
    const [scheduleId, setScheduleId] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [schedule, setSchedule] = useState<Schedule | null>(EMPTY_SCHEDULE());

    const timeDrawer = useRef<DrawerHandle>(null);
    const goalDrawer = useRef<DrawerHandle>(null);
    const typeDrawer = useRef<DrawerHandle>(null);
    const repeatTypeDrawer = useRef<DrawerHandle>(null);
    const repeatDaysDrawer = useRef<DrawerHandle>(null);

    useImperativeHandle(ref, () => ({
        open: () => {
            setScheduleId("");
            setSchedule(EMPTY_SCHEDULE());
            setIsSubmitting(false);
            drawerRef.current?.open();
        },
        close: () => drawerRef.current?.close(),
        openWithScheduleId: (id: string) => setScheduleId(id),
    }));

    const { data } = useQuery({
        queryKey: ["schedule", scheduleId],
        queryFn: async () => await scheduleService.getById(scheduleId),
        enabled: !!scheduleId,
        staleTime: 0,
    });

    useEffect(() => {
        if (data) {
            setSchedule({
                id: data.id,
                title: data.title,
                description: data.description,
                time: data.time,
                goal: data.goal,
                type: data.type,
                repeatDays: data.repeatDays,
                status: data.status,
                createdAt: data.createdAt,
                updatedAt: data.updatedAt,
            });
            setIsSubmitting(false);
            drawerRef.current?.open();
        }
    }, [data]);

    const formattedTime = () => {
        if (!schedule?.time) return null;
        const [h, m] = schedule?.time.split(":").map((v) => parseInt(v));

        const scheduledDate = new Date();
        scheduledDate.setHours(h, m, 0, 0);

        return format(scheduledDate, "hh:mm a");
    };

    const repeatDaysArray: number[] = schedule?.repeatDays
        ? JSON.parse(schedule.repeatDays)
        : [];

    const currentRepeatType = (() => {
        if (!repeatDaysArray.length) return null;
        if (repeatDaysArray.length === 7) return "Daily";
        if (
            repeatDaysArray.length === 5 &&
            [1, 2, 3, 4, 5].every((d) => repeatDaysArray.includes(d))
        )
            return "Mon to Fri";
        return "Custom";
    })();

    const handleChange = (key: keyof Schedule, value: any) => {
        setSchedule((prev) => {
            if (!prev) return null;
            return { ...prev, [key]: value };
        });
    };

    const isValid = scheduleId
        ? schedule?.title !== data?.title ||
          schedule?.description !== data?.description ||
          schedule?.time !== data?.time ||
          schedule?.goal !== data?.goal ||
          schedule?.type !== data?.type ||
          schedule?.repeatDays !== data?.repeatDays ||
          schedule?.status !== data?.status
        : !!(
              schedule?.title &&
              schedule?.time &&
              schedule?.goal &&
              schedule?.type &&
              schedule?.repeatDays &&
              repeatDaysArray.length > 0 &&
              schedule?.status
          );

    const handleSubmit = async () => {
        if (!isValid || !schedule) return;
        setIsSubmitting(true);
        try {
            if (scheduleId) {
                updateSchedule.mutateAsync({ scheduleId, schedule });
            } else {
                createSchedule.mutateAsync(schedule);
            }
            setScheduleId("");
            setSchedule(EMPTY_SCHEDULE());
            drawerRef.current?.close();
            onClose?.();
        } finally {
            setIsSubmitting(false);
        }
    };
    return (
        <>
            <Drawer ref={drawerRef} className="bg-background">
                <ColView className="gap-4 p-4">
                    <RowView className="justify-center">
                        <Text className="text-lg font-medium">
                            {scheduleId ? "Edit Schedule" : " New Schedule"}
                        </Text>
                    </RowView>
                    <ColView className="gap-4">
                        <ColView>
                            <Text>Title</Text>
                            <Card className="h-16 py-2">
                                <TextInput
                                    placeholder="eg: Morning Run"
                                    value={schedule?.title}
                                    onChangeText={(v) =>
                                        handleChange("title", v)
                                    }
                                />
                            </Card>
                        </ColView>
                        <ColView>
                            <Text>Description (Optional)</Text>
                            <Card className="h-16 py-2">
                                <TextInput
                                    placeholder="Enter description"
                                    value={schedule?.description || ""}
                                    onChangeText={(v) =>
                                        handleChange("description", v)
                                    }
                                    numberOfLines={2}
                                />
                            </Card>
                        </ColView>
                        <RowView>
                            <ColView className="flex-1">
                                <Text>Time</Text>
                                <TouchableOpacity
                                    onPress={() => timeDrawer.current?.open()}
                                >
                                    <Card className="h-16 justify-center">
                                        <Text>
                                            {formattedTime() || "Select Time"}
                                        </Text>
                                    </Card>
                                </TouchableOpacity>
                            </ColView>
                            <ColView className="flex-1">
                                <Text>Goal</Text>
                                <TouchableOpacity
                                    onPress={() => goalDrawer.current?.open()}
                                >
                                    <Card className="h-16 justify-center">
                                        <Text>
                                            {schedule?.goal
                                                ? convertMtoKm(
                                                      schedule?.goal,
                                                  ).toFixed(0) + " km"
                                                : "Select Goal"}
                                        </Text>
                                    </Card>
                                </TouchableOpacity>
                            </ColView>
                        </RowView>
                        <RowView>
                            <ColView className="flex-1">
                                <Text>Type</Text>
                                <TouchableOpacity
                                    onPress={() => typeDrawer.current?.open()}
                                >
                                    <Card className="h-16 justify-center">
                                        <Text className="capitalize">
                                            {schedule?.type || "Select Type"}
                                        </Text>
                                    </Card>
                                </TouchableOpacity>
                            </ColView>
                            <ColView className="flex-1">
                                <Text>Repeat</Text>
                                <TouchableOpacity
                                    onPress={() =>
                                        repeatTypeDrawer.current?.open()
                                    }
                                >
                                    <Card className="h-16 justify-center">
                                        <Text>
                                            {currentRepeatType ||
                                                "Select Repeat"}
                                        </Text>
                                    </Card>
                                </TouchableOpacity>
                            </ColView>
                        </RowView>
                        <RowView className="justify-between items-center">
                            <Text>Enable Schedule</Text>
                            <Switch
                                thumbColor="#02a963"
                                value={schedule?.status === "active"}
                                onValueChange={(v) =>
                                    handleChange(
                                        "status",
                                        v ? "active" : "inactive",
                                    )
                                }
                            />
                        </RowView>
                        <TouchableOpacity
                            className={cn(
                                "h-16 rounded-full bg-primary justify-center items-center",
                                (!isValid || isSubmitting) && "opacity-30",
                            )}
                            disabled={!isValid || isSubmitting}
                            onPress={handleSubmit}
                        >
                            <Text className="text-white">
                                {isSubmitting ? "Saving..." : "Save"}
                            </Text>
                        </TouchableOpacity>
                    </ColView>
                </ColView>
            </Drawer>
            <TimeDrawer
                ref={timeDrawer}
                value={schedule?.time}
                onChange={(v) => {
                    handleChange("time", v);
                }}
            />
            <GoalDrawer
                ref={goalDrawer}
                value={schedule?.goal}
                onChange={(v) => {
                    handleChange("goal", v);
                }}
            />
            <ActivityTypeDrawer
                ref={typeDrawer}
                value={schedule?.type}
                onChange={(v) => {
                    handleChange("type", v);
                }}
            />
            <RepeatTypeDrawer
                ref={repeatTypeDrawer}
                value={currentRepeatType}
                onChange={(v) => {
                    if (v === "Custom") {
                        repeatDaysDrawer.current?.open();
                        return;
                    }
                    if (v === "Daily") {
                        handleChange(
                            "repeatDays",
                            JSON.stringify([0, 1, 2, 3, 4, 5, 6]),
                        );
                    } else {
                        handleChange(
                            "repeatDays",
                            JSON.stringify([1, 2, 3, 4, 5]),
                        );
                    }
                }}
            />
            <RepeatDaysDrawer
                ref={repeatDaysDrawer}
                value={repeatDaysArray}
                onChange={(v) => {
                    handleChange("repeatDays", v);
                }}
            />
        </>
    );
});

export default ScheduleFormDrawer;
