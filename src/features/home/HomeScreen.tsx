import { ColView, RowView } from "@/shared/components/CustomView";
import Card from "@/shared/components/ui/Card";
import Text from "@/shared/components/ui/Text";
import { Dimensions, FlatList, ScrollView, View } from "react-native";
import RecentActivities from "./components/RecentActivity";

const { width } = Dimensions.get("window");
export default function HomeScreen() {
    return (
        <ScrollView showsVerticalScrollIndicator={false}>
            <ColView className="flex-1 gap-4 pb-28">
                <View className="px-4 pt-8">
                    <Text className="text-2xl text-foreground font-medium">
                        Home
                    </Text>
                </View>
                <View className="px-4">
                    <Card className="h-48" />
                </View>
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
                            <Card
                                className="h-40 w-full"
                                style={{ width: width - 32 }}
                            />
                        )}
                    />
                </ColView>
                <RecentActivities />
            </ColView>
        </ScrollView>
    );
}
