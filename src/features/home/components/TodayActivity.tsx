import { ColView, RowView } from "@/shared/components/CustomView";
import Card from "@/shared/components/ui/Card";
import RingChart from "@/shared/components/ui/RingChart";
import Text from "@/shared/components/ui/Text";
import { useActivityStore } from "@/shared/stores/use-activity.store";
import { NavigationProp } from "@/shared/types/type";
import { computeTotalDistance, convertMtoKm } from "@/shared/utils/distance";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import { format } from "date-fns";
import { useMemo } from "react";
import { TouchableOpacity, View } from "react-native";

export default function TodayActivity() {
    const navigation = useNavigation<NavigationProp>();
    const activities = useActivityStore((s) => s.activities);

    const date = new Date();
    const { todayActivities, distanceKm, goalKm, pct } = useMemo(() => {
        const todayActivities = activities.filter(
            (a) => new Date(a.createdAt).toDateString() === date.toDateString(),
        );
        const distanceKm = convertMtoKm(
            todayActivities.reduce(
                (acc, activity) =>
                    acc + computeTotalDistance(activity.coordinates),
                0,
            ),
        );
        const goalKm = convertMtoKm(
            todayActivities.reduce((acc, activity) => acc + activity.goal, 0),
        );
        const pct = (Number(distanceKm) / Number(goalKm)) * 100 || 0;

        return {
            todayActivities,
            distanceKm,
            goalKm,
            pct,
        };
    }, [activities]);

    const clampedPct = Math.min(pct, 100);
    const remainingKm = Math.max(Number(goalKm) - Number(distanceKm), 0);

    const stats = [
        {
            label: "Duration",
            value: "04:12",
            unit: "h:m",
            icon: "time-outline",
        },
        {
            label: "Calories",
            value: 123,
            unit: "kcal",
            icon: "flame-outline",
        },
        {
            label: "Avg. Pace",
            value: "5:30",
            unit: "min/km",
            icon: "timer-outline",
        },
        {
            label: "Speed",
            value: 10.9,
            unit: "km/h",
            icon: "speedometer-outline",
        },
    ];
    return (
        <ColView>
            <RowView className="px-4 justify-between items-end">
                <RowView>
                    <Text className="text-lg font-medium">Today</Text>
                    <Text className="text-lg text-muted-foreground font-medium">
                        • {format(date, "MMM d, yyyy")}
                    </Text>
                </RowView>
                <TouchableOpacity
                    onPress={() =>
                        navigation.navigate("History", {
                            initialFilter: "Today",
                        })
                    }
                >
                    <Text className="text-base text-primary font-medium">
                        {todayActivities.length}{" "}
                        {todayActivities.length === 1 ? "Session" : "Sessions"}
                    </Text>
                </TouchableOpacity>
            </RowView>
            <ColView className="px-4 gap-1">
                <Card className="">
                    <ColView className="gap-2">
                        <ColView className="gap-4">
                            <RowView className="justify-between items-end">
                                <ColView>
                                    <Text className="text-5xl font-medium">
                                        {distanceKm.toFixed(1)}{" "}
                                        <Text className="text-2xl text-muted-foreground">
                                            / {goalKm.toFixed(1)} km
                                        </Text>
                                    </Text>

                                    <Text className="text-[11px] text-muted-foreground">
                                        {clampedPct.toFixed(0)}% of daily goal
                                        {remainingKm > 0
                                            ? ` · ${remainingKm.toFixed(1)} km remaining`
                                            : " · Goal reached!"}
                                    </Text>
                                </ColView>
                                <View className="relative items-center justify-center">
                                    <RingChart
                                        pct={Math.min(pct, 100)}
                                        radius={24}
                                        strokeWidth={6}
                                        strokeLinecap="round"
                                        trackColor="rgba(128,128,128,0.05)"
                                    />
                                    <Text className="absolute text-sm font-medium">
                                        {pct.toFixed(0)}
                                        <Text className="text-[9px] font-medium">
                                            %
                                        </Text>
                                    </Text>
                                </View>
                            </RowView>
                            <View className="border-b border-border/40" />
                            <RowView>
                                {stats.map((stat, i) => (
                                    <ColView
                                        key={stat.label}
                                        className={
                                            i > 0
                                                ? "flex-1 pl-4 border-l border-border/40 gap-1"
                                                : "flex-1 gap-1"
                                        }
                                    >
                                        <RowView className="gap-1 items-center">
                                            <Ionicons
                                                name={stat.icon as any}
                                                size={11}
                                                className="text-primary"
                                            />
                                            <Text className="text-xs text-muted-foreground">
                                                {stat.label}
                                            </Text>
                                        </RowView>
                                        <ColView className="gap-0">
                                            <Text className="text-xl font-medium text-foreground">
                                                {stat.value}
                                            </Text>
                                            {stat.unit && (
                                                <Text className="text-[8px] font-normal text-muted-foreground">
                                                    {stat.unit}
                                                </Text>
                                            )}
                                        </ColView>
                                    </ColView>
                                ))}
                            </RowView>
                        </ColView>
                    </ColView>
                </Card>
            </ColView>
        </ColView>
    );
}
