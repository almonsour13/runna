import ScheduleActionDrawer, {
    ScheduleActionDrawerHandle,
} from "@/features/schedule/components/ScheduleActionDrawer";
import { ColView, RowView } from "@/shared/components/CustomView";
import Card from "@/shared/components/ui/Card";
import Text from "@/shared/components/ui/Text";
import { scheduleService } from "@/shared/services/storage/schedule.service";
import { cn } from "@/shared/utils/cn";
import { convertMtoKm } from "@/shared/utils/convert";
import { capitalize } from "@/shared/utils/utils";
import { Ionicons } from "@expo/vector-icons";
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
                <ColView className="flex-1 px-4 gap-1">
                    {isLoading ? (
                        <>
                            {Array.from({ length: 5 }).map((_, i) => (
                                <Card key={i} className="h-26" />
                            ))}
                        </>
                    ) : !hasSchedules ? (
                        <ColView className="flex-1 py-16 justify-center items-center gap-2">
                            <View className="w-14 h-14 rounded-full bg-muted/50 items-center justify-center">
                                <Ionicons
                                    name="calendar-outline"
                                    size={24}
                                    className="text-primary"
                                />
                            </View>
                            <Text className="text-base font-medium text-foreground">
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

                            const s = new Date();
                            s.setHours(parseInt(time.split(":")[0]));
                            s.setMinutes(parseInt(time.split(":")[1]));
                            s.setSeconds(0);
                            s.setMilliseconds(0);

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
                                        <ColView className="gap-4">
                                            <RowView className="justify-between items-start">
                                                <Text className="flex-1 text-base text-wrap font-medium">
                                                    {label}
                                                </Text>
                                                <RowView className="items-center gap-2">
                                                    <RowView className="items-center gap-1">
                                                        <Ionicons
                                                            name="flag"
                                                            size={12}
                                                            className="text-primary"
                                                        />
                                                        <Text className="font-medium">
                                                            {goalKm.toFixed(1)}{" "}
                                                            km
                                                        </Text>
                                                    </RowView>
                                                    <Card
                                                        className={cn(
                                                            "h-7 px-3 py-0 rounded-full border border-border justify-center items-center",
                                                        )}
                                                    >
                                                        <Text
                                                            className={cn(
                                                                "text-xs text-primary font-medium",
                                                            )}
                                                        >
                                                            {capitalize(type)}
                                                        </Text>
                                                    </Card>
                                                    <Card
                                                        className={cn(
                                                            "z-10 h-7 px-3 py-0 rounded-full border border-border justify-center items-center",
                                                        )}
                                                    >
                                                        <Text
                                                            className={cn(
                                                                "text-xs text-primary font-medium",
                                                                !isActive &&
                                                                    "text-destructive",
                                                            )}
                                                        >
                                                            {capitalize(status)}
                                                        </Text>
                                                    </Card>
                                                </RowView>
                                            </RowView>
                                            <RowView className="justify-between items-center">
                                                <RowView className="items-center gap-1">
                                                    <Ionicons
                                                        name="time"
                                                        size={16}
                                                        className="text-primary"
                                                    />
                                                    <Text className="font-medium">
                                                        {format(s, "hh:mm a")}
                                                    </Text>
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
                                                                        "h-7 w-7 p-0 aspect-square rounded-full border border-border justify-center items-center",
                                                                        hasDay &&
                                                                            "bg-primary",
                                                                    )}
                                                                >
                                                                    <Text className="text-xs font-medium">
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
                                            <Card className="absolute inset-0 bg-card/85" />
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
