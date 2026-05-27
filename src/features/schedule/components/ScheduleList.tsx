import ScheduleActionDrawer, {
    ScheduleActionDrawerHandle,
} from "@/features/schedule/components/ScheduleActionDrawer";
import { ColView, RowView } from "@/shared/components/CustomView";
import Divider from "@/shared/components/Divider";
import Icon from "@/shared/components/Icon";
import Card from "@/shared/components/ui/Card";
import Text from "@/shared/components/ui/Text";
import { ACTIVITY_TYPE_COLOR } from "@/shared/constant/constant";
import { scheduleService } from "@/shared/services/storage/schedule.service";
import { ActivityType } from "@/shared/types/type";
import { cn } from "@/shared/utils/cn";
import { convertMtoKm } from "@/shared/utils/convert";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { useRef } from "react";
import { TouchableOpacity, View } from "react-native";

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function ScheduleList() {
    const scheduleActionDrawer = useRef<ScheduleActionDrawerHandle>(null);
    const { data: schedules = [], isLoading } = useQuery({
        queryKey: ["schedules"],
        queryFn: async () => {
            return await scheduleService.get();
        },
    });
    const hasSchedules = schedules.length > 0;
    return (
        <>
            <ColView>
                <RowView className="px-4 justify-between items-end">
                    <Text className="text-lg font-medium">
                        Manage your Schedules
                    </Text>
                    {hasSchedules && (
                        <Text className="text-base text-primary font-medium">
                            {schedules.length}{" "}
                            {schedules.length === 1 ? "Schedule" : "Schedules"}
                        </Text>
                    )}
                </RowView>
                <ColView className="flex-1 px-4 gap-2">
                    {isLoading ? (
                        <>
                            {Array.from({ length: 8 }).map((_, i) => (
                                <Card key={i} className="h-26" />
                            ))}
                        </>
                    ) : !hasSchedules ? (
                        <ColView className="flex-1 py-16 justify-center items-center gap-2">
                            <View className="w-14 h-14 rounded-full bg-muted/50 items-center justify-center">
                                <Icon
                                    name="calendar-outline"
                                    size={24}
                                    className="text-primary"
                                />
                            </View>
                            <Text className="text-base font-medium">
                                No schedules yet
                            </Text>
                            <Text className="text-sm text-muted-foreground text-center">
                                Tap the button below to create your first
                                schedule
                            </Text>
                        </ColView>
                    ) : (
                        schedules.map((schedule) => {
                            const {
                                title,
                                type,
                                goal,
                                time,
                                repeatDays,
                                status,
                            } = schedule;
                            const repeatDaysArray = repeatDays
                                ? JSON.parse(repeatDays)
                                : [];

                            const [h, m] = time.split(":").map(Number);

                            const scheduledDate = new Date();
                            scheduledDate.setHours(h, m, 0, 0);
                            const label = [title].join(" • ");
                            const goalKm = convertMtoKm(goal);
                            const isActive = status === "active";
                            return (
                                <TouchableOpacity
                                    key={schedule.id}
                                    onPress={() =>
                                        scheduleActionDrawer.current?.openWithScheduleId(
                                            schedule.id,
                                        )
                                    }
                                >
                                    <Card className="relative overflow-hidden">
                                        <ColView className="">
                                            <RowView className="justify-between items-center">
                                                <Text className="flex-1 text-base text-wrap font-medium">
                                                    {label}
                                                </Text>
                                                <RowView className="items-center gap-2">
                                                    <Text
                                                        className="capitalize text-xs font-medium text-primary bg-muted px-1.5 py-0.5 rounded"
                                                        style={{
                                                            color: ACTIVITY_TYPE_COLOR[
                                                                type as ActivityType
                                                            ],
                                                        }}
                                                    >
                                                        {type}
                                                    </Text>
                                                    <Text
                                                        className={cn(
                                                            "z-10 capitalize text-xs font-medium bg-muted px-1.5 py-0.5 rounded",
                                                            isActive
                                                                ? "text-primary"
                                                                : "text-destructive",
                                                        )}
                                                    >
                                                        {status}
                                                    </Text>
                                                </RowView>
                                            </RowView>
                                            <Divider />
                                            <RowView className="justify-between items-center">
                                                <RowView className="">
                                                    <RowView className="items-center gap-1">
                                                        <Icon
                                                            name="time"
                                                            size={12}
                                                            className="text-primary"
                                                        />
                                                        <Text className="text-xs text-muted-foreground">
                                                            {format(
                                                                scheduledDate,
                                                                "hh:mm a",
                                                            )}
                                                        </Text>
                                                    </RowView>
                                                    <RowView className="items-center gap-1">
                                                        <Icon
                                                            name="flag"
                                                            size={12}
                                                            className="text-primary"
                                                        />
                                                        <Text className="text-xs text-muted-foreground">
                                                            {goalKm.toFixed(1)}{" "}
                                                            km
                                                        </Text>
                                                    </RowView>
                                                </RowView>
                                                <RowView className="gap-1">
                                                    {DAY_LABELS.map(
                                                        (label, index) => {
                                                            const hasDay =
                                                                repeatDaysArray.includes(
                                                                    index,
                                                                );
                                                            return (
                                                                <Card
                                                                    key={label}
                                                                    className={cn(
                                                                        "h-6 w-6 p-0 aspect-square rounded-full bg-muted justify-center items-center",
                                                                        hasDay &&
                                                                            "bg-primary",
                                                                    )}
                                                                >
                                                                    <Text
                                                                        className={cn(
                                                                            "text-xs font-medium",
                                                                            hasDay &&
                                                                                "text-white",
                                                                        )}
                                                                    >
                                                                        {label.charAt(
                                                                            0,
                                                                        )}
                                                                    </Text>
                                                                </Card>
                                                            );
                                                        },
                                                    )}
                                                </RowView>
                                            </RowView>
                                        </ColView>
                                        {!isActive && (
                                            <Card className="absolute inset-0 bg-card/75" />
                                        )}
                                    </Card>
                                </TouchableOpacity>
                            );
                        })
                    )}
                </ColView>
            </ColView>
            <ScheduleActionDrawer ref={scheduleActionDrawer} />
        </>
    );
}
