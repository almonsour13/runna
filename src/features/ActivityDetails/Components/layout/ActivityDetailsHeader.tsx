import { ColView, RowView } from "@/shared/components/CustomView";
import ActivityActionDrawer, {
    ActivityActionDrawerHandle,
} from "@/shared/components/drawer/ActivityActionDrawer";
import Card from "@/shared/components/ui/Card";
import Text from "@/shared/components/ui/Text";
import { Activity } from "@/shared/types/type";
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
            <RowView className="absolute z-10 top-0 left-0 right-0 p-4  gap-2 items-center">
                <RowView className="flex-1 gap-4 items-center">
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Card className="p-2 rounded-full aspect-square">
                            <Ionicons name="arrow-back" size={20} />
                        </Card>
                    </TouchableOpacity>
                    {activity && (
                        <ColView className="hidden gap-0">
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
                        <TouchableOpacity
                            onPress={() =>
                                activityActionDrawerRef.current?.openWithActivityId(
                                    activity.id,
                                )
                            }
                        >
                            <Card className="p-2 rounded-full aspect-square">
                                <Ionicons name="ellipsis-vertical" size={20} />
                            </Card>
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
