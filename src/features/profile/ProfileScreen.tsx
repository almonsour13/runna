import { ColView, RowView } from "@/shared/components/CustomView";
import { Dimensions, FlatList, Text, View } from "react-native";

const { width } = Dimensions.get("window");

export default function ProfileScreen() {
    return (
        <ColView className="flex-1 gap-4 pb-4">
            <View className="px-4 pt-8">
                <Text className="text-2xl text-foreground font-medium">
                    Profile
                </Text>
            </View>
            {/* User Info */}
            <RowView className="px-4 items-center gap-4">
                <View className="h-20 w-20 rounded-full bg-card border border-border" />
                <ColView>
                    <Text className="text-base text-foreground">Username</Text>
                    <Text className="text-sm text-muted-foreground">
                        @handle
                    </Text>
                </ColView>
            </RowView>

            {/* Actions */}
            <RowView className="px-4 gap-2">
                <View className="flex-1 h-12 rounded-2xl bg-card border border-border justify-center items-center">
                    <Text className="text-sm text-foreground">
                        Edit Profile
                    </Text>
                </View>
                <View className="flex-1 h-12 rounded-2xl bg-card border border-border justify-center items-center">
                    <Text className="text-sm text-foreground">Settings</Text>
                </View>
            </RowView>

            {/* Activity */}
            <ColView className="gap-2">
                <RowView className="px-4 justify-between">
                    <Text className="text-base text-foreground">
                        Recent Activity
                    </Text>
                    <Text className="text-base text-muted-foreground">
                        See All
                    </Text>
                </RowView>

                <FlatList
                    data={Array.from({ length: 6 })}
                    keyExtractor={(_, i) => i.toString()}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{
                        paddingHorizontal: 16,
                        paddingBottom: 16,
                        gap: 8,
                    }}
                    renderItem={() => (
                        <View
                            className="h-24 rounded-2xl bg-card border border-border"
                            style={{ width: width - 32 }}
                        />
                    )}
                />
            </ColView>
        </ColView>
    );
}
