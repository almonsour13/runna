import { ColView, RowView } from "@/shared/components/CustomView";
import Card from "@/shared/components/ui/Card";
import Text from "@/shared/components/ui/Text";
import { useProfileStore } from "@/shared/stores/use-profile.store";
import { Profile } from "@/shared/types/type";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useState } from "react";
import {
    FlatList,
    NativeScrollEvent,
    NativeSyntheticEvent,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

const ITEM_HEIGHT = 50;
export default function ProfileEditScreen() {
    const navigation = useNavigation();
    const profile = useProfileStore((s) => s.profile);
    const [newProfile, setNewProfile] = useState<Profile | null>(profile);
    const ages = Array.from({ length: 100 }, (_, i) => i + 1);

    const onScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const offsetY = event.nativeEvent.contentOffset.y;

        const index = Math.round(offsetY / ITEM_HEIGHT);

        const selectedAge = ages[index];

        console.log(selectedAge);
    };
    return (
        <ColView className="flex-1 gap-8">
            <RowView className="px-4 pt-8 ">
                <RowView className="gap-4 items-center">
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Ionicons
                            name="arrow-back"
                            size={24}
                            className="text-foreground"
                        />
                    </TouchableOpacity>
                    <Text className="text-2xl">Edit Profile</Text>
                </RowView>
            </RowView>
            <ColView className="px-4 gap-4">
                <ColView>
                    <Text>Name</Text>
                    <Card className="h-18">
                        <TextInput />
                    </Card>
                </ColView>
                <RowView>
                    <ColView className="flex-1">
                        <Text>Age</Text>
                        <Card className="h-18"></Card>
                    </ColView>
                    <ColView className="flex-1">
                        <Text>Gender</Text>
                        <Card className="h-18"></Card>
                    </ColView>
                </RowView>
                <RowView>
                    <ColView className="flex-1">
                        <Text>Height</Text>
                        <Card className="h-18"></Card>
                    </ColView>
                    <ColView className="flex-1">
                        <Text>Weight</Text>
                        <Card className="h-18"></Card>
                    </ColView>
                </RowView>
                <ColView>
                    <Text>Goal</Text>
                    <Card className="h-18"></Card>
                </ColView>
            </ColView>
            <ColView className="flex-1 justify-end">
                <FlatList
                    data={ages}
                    snapToInterval={ITEM_HEIGHT}
                    decelerationRate="fast"
                    showsVerticalScrollIndicator={false}
                    onMomentumScrollEnd={onScrollEnd}
                    contentContainerStyle={{
                        paddingVertical: ITEM_HEIGHT,
                    }}
                    style={{
                        height: ITEM_HEIGHT * 1, // visible rows
                    }}
                    renderItem={({ item }) => (
                        <View
                            style={{
                                height: ITEM_HEIGHT,
                                justifyContent: "center",
                                alignItems: "center",
                            }}
                            className="bg-red-200"
                        >
                            <Text>{item}</Text>
                        </View>
                    )}
                />
            </ColView>
        </ColView>
    );
}
