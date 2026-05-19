import { ColView, RowView } from "@/shared/components/CustomView";
import ActivityActionDrawer, {
    ActivityActionDrawerHandle,
} from "@/shared/components/drawer/ActivityActionDrawer";
import Text from "@/shared/components/ui/Text";
import { Activity } from "@/shared/db/repositories/activity.repository";
import { capitalize, timeSession } from "@/shared/utils/utils";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import { useRef } from "react";
import { TouchableOpacity } from "react-native";

export default function ActivityDetailsHeader({
    activity,
}: {
    activity: Activity | null;
}) {
    const navigation = useNavigation();

    const activityActionDrawerRef = useRef<ActivityActionDrawerHandle>(null);

    return (
        <>
            <RowView className="bg-background sticky top-0 p-4 border-b border-border gap-2 items-center">
                <RowView className="flex-1 gap-4 items-center">
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Ionicons name="arrow-back" size={24} />
                    </TouchableOpacity>
                    {activity && (
                        <ColView className="gap-0">
                            <Text className="text-lg font-medium">
                                {capitalize(
                                    timeSession(
                                        activity.startTime.toDateString(),
                                    ),
                                )}{" "}
                                {capitalize(activity.type)}
                            </Text>
                        </ColView>
                    )}
                </RowView>
                {activity && (
                    <RowView className="gap-4">
                        <Ionicons name="share-social" size={24} />
                        <TouchableOpacity
                            onPress={() =>
                                activityActionDrawerRef.current?.openWithActivityId(
                                    activity.id,
                                )
                            }
                        >
                            <Ionicons name="ellipsis-vertical" size={24} />
                        </TouchableOpacity>
                    </RowView>
                )}
            </RowView>
            <ActivityActionDrawer
                ref={activityActionDrawerRef}
                hide_action={["view details"]}
                onClose={() => navigation.goBack()}
            />
        </>
    );
}
