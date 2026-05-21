import { RowView } from "@/shared/components/CustomView";
import Text from "@/shared/components/ui/Text";
import { NavigationProp } from "@/shared/types/type";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { TouchableOpacity } from "react-native";

export default function ScheduleHeader() {
    const navigation = useNavigation<NavigationProp>();
    return (
        <RowView className="px-4 pt-8 gap-4 pb-4">
            <RowView className="gap-4 items-center">
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons
                        name="arrow-back"
                        size={24}
                        className="text-foreground"
                    />
                </TouchableOpacity>
                <Text className="text-2xl">Schedule</Text>
            </RowView>
        </RowView>
    );
}
