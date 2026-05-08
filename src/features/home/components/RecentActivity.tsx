import ActivityCard from "@/shared/components/ActivityCard";
import { ColView, RowView } from "@/shared/components/CustomView";
import Text from "@/shared/components/ui/Text";
import { useActivityStore } from "@/shared/stores/use-activity.store";
import { NavigationProp } from "@/shared/types/type";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useMemo } from "react";
import { TouchableOpacity } from "react-native";

export default function RecentActivities() {
    const navigation = useNavigation<NavigationProp>();
    const activities = useActivityStore((s) => s.activities);

    const recentActivities = useMemo(() => {
        return [...activities]
            .sort(
                (a, b) =>
                    new Date(b.createdAt).getTime() -
                    new Date(a.createdAt).getTime(),
            )
            .slice(0, 5);
    }, [activities]);

    return (
        <ColView>
            <RowView className="px-4 justify-between items-end">
                <Text className="text-lg font-medium">Recent</Text>
                {recentActivities.length > 0 && (
                    <TouchableOpacity
                        onPress={() =>
                            navigation.navigate("History", {
                                initialFilter: "All",
                            })
                        }
                    >
                        <Text className="text-base font-medium text-primary">
                            See All
                        </Text>
                    </TouchableOpacity>
                )}
            </RowView>

            {recentActivities.length === 0 ? (
                <ColView className="px-4 py-8 items-center gap-2">
                    <Ionicons
                        name="footsteps-outline"
                        size={40}
                        className="text-muted-foreground opacity-40"
                    />
                    <Text className="text-base font-medium text-foreground">
                        No activities yet
                    </Text>
                    <Text className="text-sm text-muted-foreground text-center">
                        Complete your first run to see it here
                    </Text>
                </ColView>
            ) : (
                <ColView className="px-4 gap-1">
                    {recentActivities.map((activity) => (
                        <ActivityCard key={activity.id} activity={activity} />
                    ))}
                </ColView>
            )}
        </ColView>
    );
}
