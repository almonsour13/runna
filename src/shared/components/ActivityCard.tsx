import { ColView, RowView } from "@/shared/components/CustomView";
import Card from "@/shared/components/ui/Card";
import Text from "@/shared/components/ui/Text";
import { useNavigation } from "@react-navigation/native";
import { format, isToday, isYesterday } from "date-fns";
import { TouchableOpacity, View } from "react-native";
import { Activity, NavigationProp } from "../types/type";
import { computeTotalDistance } from "../utils/compute";
import { convertMtoKm } from "../utils/convert";
import { capitalize } from "../utils/utils";
import RouteMap from "./RouteMap";

export default function ActivityCard({ activity }: { activity: Activity }) {
    const navigation = useNavigation<NavigationProp>();
    const date = isToday(activity.startTime)
        ? "Today"
        : isYesterday(activity.startTime)
          ? "Yesterday"
          : format(activity.startTime, "MMM d");

    const timeRange = [
        date,
        format(activity.startTime, "p"),
        format(activity.endTime, "p"),
    ].join(" • ");

    const distanceKm = convertMtoKm(computeTotalDistance(activity.coordinates));
    const goalKm = convertMtoKm(activity.goal);
    const pct = (Number(distanceKm) / Number(goalKm)) * 100 || 0;
    return (
        <TouchableOpacity
            activeOpacity={0.9}
            onPress={() =>
                navigation.navigate("ActivityDetails", {
                    activityId: activity.id,
                })
            }
        >
            <Card key={activity.id}>
                <RowView className="gap-4 ">
                    <View className="h-18 aspect-square justify-center items-center rounded">
                        <RouteMap
                            coordinates={activity.coordinates}
                            type={activity.type}
                            strokeWidth={2}
                            size={136}
                        />
                    </View>
                    <ColView className="flex-1">
                        <RowView className="justify-between items-center">
                            <Text className="text-xs text-muted-foreground">
                                {timeRange}
                            </Text>
                            <Text className="text-xs font-medium text-primary">
                                {capitalize(activity.type)}
                            </Text>
                        </RowView>
                        <RowView className="justify-between items-end">
                            <Text className="text-2xl font-medium">
                                {distanceKm.toFixed(1)}{" "}
                                <Text className="text-sm text-muted-foreground">
                                    / {goalKm.toFixed(1)} km
                                </Text>
                            </Text>
                            <Text className="text-sm font-medium">
                                {pct.toFixed(0)}%
                            </Text>
                        </RowView>
                        <ColView>
                            <View className="bg-muted w-full h-1 rounded-full overflow-hidden">
                                <View
                                    className="h-1 bg-primary"
                                    style={{
                                        width: `${pct}%`,
                                    }}
                                />
                            </View>
                        </ColView>
                    </ColView>
                </RowView>
            </Card>
        </TouchableOpacity>
    );
}
