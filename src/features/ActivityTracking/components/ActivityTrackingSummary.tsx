import { ColView, RowView } from "@/shared/components/CustomView";
import Text from "@/shared/components/ui/Text";
import { useActivityTrackingStore } from "@/shared/stores/use-activity-tracking.store";
import { formatDurationHHMMSS } from "@/shared/utils/format";
import Ionicons from "@expo/vector-icons/Ionicons";
import { View } from "react-native";

export default function ActivityTrackingSummary() {
    const activity = useActivityTrackingStore((s) => s.activity);
    const duration = activity.duration;
    const time = formatDurationHHMMSS(duration);

    const stats = [
        {
            label: "Distance",
            value: "5.5",
            unit: "km",
            icon: "location-outline" as const,
        },
        {
            label: "Calories",
            value: 123,
            unit: "kcal",
            icon: "flame-outline" as const,
        },
        {
            label: "Pace",
            value: "12:12",
            unit: "min/km",
            icon: "timer-outline" as const,
        },
    ];
    return (
        <ColView className="p-4 gap-8 justify-center items-center">
            <RowView className="justify-center items-center">
                <ColView className="gap-1 items-center">
                    <RowView className="gap-1 items-center">
                        <Ionicons
                            name="time-outline"
                            size={12}
                            className="text-primary"
                        />
                        <Text className="text-sm text-muted-foreground">
                            Duration
                        </Text>
                    </RowView>
                    <Text className="text-7xl font-bold">{time}</Text>
                </ColView>
            </RowView>
            <RowView className="">
                {stats.map((stat, index) => {
                    return (
                        <ColView
                            key={stat.label}
                            className="flex-1 gap-1 justify-center items-center"
                        >
                            <RowView className="gap-1 items-center">
                                <Ionicons
                                    name={stat.icon}
                                    size={12}
                                    className="text-primary"
                                />
                                <Text className="text-xs text-muted-foreground">
                                    {stat.label}
                                </Text>
                            </RowView>
                            <Text className="text-4xl font-medium">
                                {stat.value}
                            </Text>
                            {stat.unit && (
                                <Text className="text-[8px] font-medium text-muted-foreground">
                                    {stat.unit}
                                </Text>
                            )}
                        </ColView>
                    );
                })}
            </RowView>
            <RowView className="hidden items-center">
                <Text className="text-[8px] font-medium text-muted-foreground">
                    0%
                </Text>
                <View className="h-1.5 w-56 bg-primary rounded-full" />
                <Text className="text-[8px] font-medium text-muted-foreground">
                    100%
                </Text>
            </RowView>
        </ColView>
    );
}
