import { ColView, RowView } from "@/shared/components/CustomView";
import Card from "@/shared/components/ui/Card";
import Text from "@/shared/components/ui/Text";
import { db } from "@/shared/db";
import { schedule } from "@/shared/db/schema";
import { cn } from "@/shared/utils/cn";
import { convertMtoKm } from "@/shared/utils/convert";
import { capitalize } from "@/shared/utils/utils";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { View } from "react-native";

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function ScheduleList() {
    const { data: schedules, isLoading } = useQuery({
        queryKey: ["schedules"],
        queryFn: async () => {
            return await db.select().from(schedule).orderBy(schedule.createdAt);
        },
    });
    return (
        <ColView className="px-4 gap-1">
            {schedules?.map((schedule) => {
                const {
                    name,
                    type,
                    goal,
                    time,
                    repeatDays,
                    repeatType,
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

                const label = [name].join(" • ");
                const goalKm = convertMtoKm(goal);
                const isActive = status === "active";
                return (
                    <Card
                        key={schedule.id}
                        className="relative overflow-hidden"
                    >
                        <ColView className="gap-4">
                            <RowView className="justify-between items-start">
                                <Text className="flex-1 text-lg text-wrap font-medium">
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
                                            {goalKm.toFixed(1)} km
                                        </Text>
                                    </RowView>
                                    <Card
                                        className={cn(
                                            "z-10 h-7 px-3 py-0 rounded-full border border-border justify-center items-center",
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
                                                !isActive && "text-destructive",
                                            )}
                                        >
                                            {capitalize(status)}
                                        </Text>
                                    </Card>
                                </RowView>
                            </RowView>
                            <View className="h-px bg-border/50" />
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
                                {repeatType === "weekly" && repeatDaysArray ? (
                                    <RowView className="gap-1">
                                        {DAY_LABELS.map((label, index) => {
                                            const hasDay =
                                                repeatDaysArray.includes(index);
                                            return (
                                                <Card
                                                    key={label}
                                                    className={cn(
                                                        "h-7 w-7 p-0 aspect-square rounded-full border border-border justify-center items-center",
                                                        hasDay && "bg-primary",
                                                    )}
                                                >
                                                    <Text className="text-xs font-medium">
                                                        {label.charAt(0)}
                                                    </Text>
                                                </Card>
                                            );
                                        })}
                                    </RowView>
                                ) : (
                                    <RowView className="gap-2">
                                        <Ionicons
                                            name="repeat"
                                            size={20}
                                            className="text-primary"
                                        />
                                        <Card
                                            className={cn(
                                                "h-7 px-3 py-0 rounded-full border border-border justify-center items-center",
                                            )}
                                        >
                                            <Text className="text-xs font-medium">
                                                {capitalize(repeatType)}
                                            </Text>
                                        </Card>
                                    </RowView>
                                )}
                            </RowView>
                        </ColView>
                        {!isActive && (
                            <Card className="absolute inset-0 bg-card/85" />
                        )}
                    </Card>
                );
            })}
        </ColView>
    );
}
