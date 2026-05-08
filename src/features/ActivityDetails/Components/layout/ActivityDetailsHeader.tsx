import { ColView, RowView } from "@/shared/components/CustomView";
import Text from "@/shared/components/ui/Text";
import { capitalize, timeSession } from "@/shared/utils/utils";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import { TouchableOpacity } from "react-native";
import { useActivityDetails } from "../../context/ActivityDetailsContext";

export default function ActivityDetailsHeader() {
    const navigation = useNavigation();
    const { activity } = useActivityDetails();
    return (
        <RowView className="px-4 pt-4 gap-2 items-center">
            <RowView className="flex-1 gap-4 items-center">
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} />
                </TouchableOpacity>
                <ColView className="gap-0">
                    <Text className="text-lg font-medium">
                        {capitalize(timeSession(activity.startTime))}{" "}
                        {capitalize(activity.type)}
                    </Text>
                </ColView>
            </RowView>
            <RowView>
                <Ionicons name="share-social" size={24} />
            </RowView>
        </RowView>
    );
}
