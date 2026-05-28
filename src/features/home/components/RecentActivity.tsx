import ActivityCard from "@/shared/components/ActivityCard";
import { ColView, RowView } from "@/shared/components/CustomView";
import Card from "@/shared/components/ui/Card";
import Icon from "@/shared/components/ui/Icon";
import Text from "@/shared/components/ui/Text";
import { activityService } from "@/shared/services/storage/activity.service";
import { NavigationProp } from "@/shared/types/type";
import { useNavigation } from "@react-navigation/native";
import { useQuery } from "@tanstack/react-query";
import { TouchableOpacity } from "react-native";

export default function RecentActivities() {
    const navigation = useNavigation<NavigationProp>();
    const {
        data: activities = [],
        isLoading,
        error,
    } = useQuery({
        queryKey: ["home", "recent"],
        queryFn: async () => {
            const data = await activityService.get({ limit: 5, offset: 0 });
            return data;
        },
        staleTime: 0,
    });

    const hasActivities = activities.length > 0;

    return (
        <ColView>
            <RowView className="px-4 justify-between items-end">
                <Text className="text-lg font-medium">Recent</Text>
                {activities.length > 0 && (
                    <TouchableOpacity
                        onPress={() =>
                            navigation.navigate("History", {
                                initialFilter: "All",
                            })
                        }
                    >
                        <Text className="text-base font-medium text-primary">
                            View All
                        </Text>
                    </TouchableOpacity>
                )}
            </RowView>
            {isLoading ? (
                <ColView className="px-4 gap-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <Card key={i} className="h-22" />
                    ))}
                </ColView>
            ) : !hasActivities ? (
                <ColView className="px-4 py-8 items-center gap-2">
                    <Icon
                        name="footsteps-outline"
                        size={40}
                        className="text-muted-foreground opacity-40"
                    />
                    <Text className="text-base font-medium">
                        No activities yet
                    </Text>
                    <Text className="text-sm text-muted-foreground text-center">
                        Complete your first run to see it here
                    </Text>
                </ColView>
            ) : (
                <ColView className="px-4 gap-2">
                    {activities.map((activity) => (
                        <ActivityCard key={activity.id} activity={activity} />
                    ))}
                </ColView>
            )}
        </ColView>
    );
}
