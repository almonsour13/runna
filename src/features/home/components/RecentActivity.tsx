import ActivityCard from "@/shared/components/ActivityCard";
import { ColView, RowView } from "@/shared/components/CustomView";
import Text from "@/shared/components/ui/Text";
import { useActivityStore } from "@/shared/stores/use-activity.store";
import { NavigationProp } from "@/shared/types/type";
import { useNavigation } from "@react-navigation/native";
import { useMemo } from "react";
import { TouchableOpacity } from "react-native";

export default function RecentActivities() {
    const navigation = useNavigation<NavigationProp>();
    const activities = useActivityStore((s) => s.activities);

    const recentActivities = useMemo(() => {
        return activities.slice(0, 5);
    }, [activities]);

    return (
        <ColView>
            <RowView className="px-4 justify-between items-end">
                <Text className="text-lg font-medium">Recent</Text>
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
            </RowView>
            <ColView className="px-4 gap-1">
                {recentActivities.map((activity) => (
                    <ActivityCard key={activity.id} activity={activity} />
                ))}
            </ColView>
        </ColView>
    );
}
