import { ColView, RowView } from "@/shared/components/CustomView";
import Icon from "@/shared/components/Icon";
import Text from "@/shared/components/ui/Text";
import { useProfileStore } from "@/shared/stores/use-profile.store";
import { useNavigation } from "@react-navigation/native";
import { ScrollView, TouchableOpacity } from "react-native";

export default function ProfileScreen() {
    const navigation = useNavigation();
    const profile = useProfileStore((s) => s.profile);

    return (
        <ScrollView style={{ flexGrow: 1 }}>
            <ColView className="flex-1 gap-4">
                <RowView className="px-4 pt-8 ">
                    <RowView className="gap-4 items-center">
                        <TouchableOpacity onPress={() => navigation.goBack()}>
                            <Icon
                                name="arrow-back"
                                size={24}
                                className="text-foreground"
                            />
                        </TouchableOpacity>
                        <Text className="text-2xl">Profile</Text>
                    </RowView>
                </RowView>
            </ColView>
        </ScrollView>
    );
}
