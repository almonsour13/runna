import { RowView } from "@/shared/components/CustomView";
import Text from "@/shared/components/ui/Text";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import { TouchableOpacity } from "react-native";

export default function ActivityTrackingHeader() {
    const navigation = useNavigation();
    return (
        <RowView className="px-4 pt-4 gap-2 items-center">
            <RowView className="hidden gap-4 items-center">
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} />
                </TouchableOpacity>
            </RowView>
            <RowView className="flex-1 justify-center items-center">
                <Text className="text-lg">Morning Walk</Text>
            </RowView>
            <RowView className="hidden">
                <TouchableOpacity>
                    <Ionicons name="arrow-back" size={24} />
                </TouchableOpacity>
            </RowView>
        </RowView>
    );
}
