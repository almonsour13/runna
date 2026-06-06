import { RowView } from "@/shared/components/CustomView";
import ActivityActionDrawer, {
    ActivityActionDrawerHandle,
} from "@/shared/components/drawer/ActivityActionDrawer";
import Icon from "@/shared/components/ui/Icon";
import Text from "@/shared/components/ui/Text";
import { NavigationProp } from "@/shared/types/type";
import { useNavigation } from "@react-navigation/native";
import { useRef } from "react";
import { TouchableOpacity } from "react-native";
import { useActivityDetailsContext } from "../context/ActivityDetailsContext";

export default function ActivityDetailsHeader() {
    const { activity } = useActivityDetailsContext();

    const navigation = useNavigation<NavigationProp>();

    const activityActionDrawerRef = useRef<ActivityActionDrawerHandle>(null);

    return (
        <>
            <RowView className="p-4 items-center">
                <RowView className="gap-4 flex-1 items-center">
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Icon
                            name="arrow-back"
                            size={24}
                            className="text-foreground"
                        />
                    </TouchableOpacity>
                    <Text className="text-2xl font-medium capitalize">
                        Activity Details
                    </Text>
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
                onClose={(action) => {
                    navigation.goBack();
                }}
            />
        </>
    );
}
