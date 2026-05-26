import { RowView } from "@/shared/components/CustomView";
import Icon from "@/shared/components/Icon";
import Text from "@/shared/components/ui/Text";
import { NavigationProp } from "@/shared/types/type";
import { useNavigation } from "@react-navigation/native";
import { TouchableOpacity } from "react-native";

export default function ScheduleHeader() {
    const navigation = useNavigation<NavigationProp>();
    return (
        <RowView className="p-4">
            <RowView className="items-center">
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Icon
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
