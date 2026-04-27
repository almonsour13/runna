import { ColView, RowView } from "@/shared/components/CustomView";
import { Dimensions, FlatList, ScrollView, Text, View } from "react-native";

const { width } = Dimensions.get("window");
export default function HomeScreen() {
    return (
        <ScrollView showsVerticalScrollIndicator={false}>
            <ColView className="flex-1 gap-4 pb-4">
                <View className="px-4 pt-8">
                    <Text className="text-2xl text-foreground font-medium">
                        Home
                    </Text>
                </View>
                <View className="px-4">
                    <View className="h-48 rounded-2xl bg-card border border-border" />
                </View>

                <ColView className="gap-2">
                    <RowView className="px-4 justify-between">
                        <Text className="text-base text-foreground">
                            Category
                        </Text>
                        <Text className="text-base text-muted-foreground">
                            See All
                        </Text>
                    </RowView>
                    <RowView className="px-4 gap-2">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <View
                                key={i}
                                className="h-24 flex-1 rounded-2xl bg-card border border-border"
                            />
                        ))}
                    </RowView>
                </ColView>
                <ColView className="gap-2">
                    <RowView className="px-4 justify-between">
                        <Text className="text-base text-foreground">
                            Trending
                        </Text>
                        <Text className="text-base text-muted-foreground">
                            See All
                        </Text>
                    </RowView>
                    <FlatList
                        data={["1", "2", "3"]}
                        horizontal
                        keyExtractor={(item) => item}
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{
                            paddingHorizontal: 16,
                            gap: 8,
                        }}
                        className=""
                        renderItem={() => (
                            <View
                                className="h-40 w-full rounded-2xl bg-card border border-border"
                                style={{ width: width - 32 }}
                            />
                        )}
                    />
                </ColView>
                <ColView className="gap-2">
                    <RowView className="px-4 justify-between">
                        <Text className="text-base text-foreground">
                            Recent Activity
                        </Text>
                        <Text className="text-base text-muted-foreground">
                            See All
                        </Text>
                    </RowView>
                    <ColView className="px-4 gap-2 ">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <View
                                key={i}
                                className="h-24 rounded-2xl bg-card border border-border"
                            />
                        ))}
                    </ColView>
                </ColView>
            </ColView>
        </ScrollView>
    );
}
