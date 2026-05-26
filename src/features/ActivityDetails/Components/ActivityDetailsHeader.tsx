import { ColView, RowView } from "@/shared/components/CustomView";
import ActivityActionDrawer, {
    ActivityActionDrawerHandle,
} from "@/shared/components/drawer/ActivityActionDrawer";
import Icon from "@/shared/components/Icon";
import Text from "@/shared/components/ui/Text";
import { Activity } from "@/shared/types/type";
import { timeSession } from "@/shared/utils/utils";
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
            <RowView className="p-4 items-center">
                <RowView className="flex-1 items-center">
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Icon
                            name="arrow-back"
                            size={24}
                            className="text-foreground"
                        />
                    </TouchableOpacity>
                    {activity && (
                        <ColView className="gap-0">
                            <Text className="text-2xl font-medium capitalize">
                                {timeSession(activity.startTime.toDateString())}{" "}
                                {activity.type}
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
                            <Icon
                                name="ellipsis-vertical"
                                size={20}
                                className="text-foreground"
                            />
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
