import { ColView, RowView } from "@/shared/components/CustomView";
import Card from "@/shared/components/ui/Card";
import { Dimensions, FlatList, ScrollView, Text, View } from "react-native";

const { width } = Dimensions.get("window");

export default function ExploreScreen() {
    return (
        <ScrollView showsVerticalScrollIndicator={false}>
            <ColView className="flex-1 gap-4 pb-4">
                <View className="px-4 pt-8">
                    <Text className="text-2xl text-foreground font-medium">
                        Explore
                    </Text>
                </View>
                <View className="px-4">
                    <Card className="h-14 w-full" />
                </View>

                {/* Categories */}
                <ColView className="gap-2">
                    <RowView className="px-4 justify-between">
                        <Text className="text-base text-foreground">
                            Categories
                        </Text>
                        <Text className="text-base text-muted-foreground">
                            See All
                        </Text>
                    </RowView>

                    <FlatList
                        data={Array.from({ length: 6 })}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        keyExtractor={(_, i) => i.toString()}
                        contentContainerStyle={{
                            paddingHorizontal: 16,
                            gap: 8,
                        }}
                        renderItem={() => <Card className="h-24 w-24" />}
                    />
                </ColView>

                {/* Explore Feed */}
                <ColView className="gap-2">
                    <RowView className="px-4 justify-between">
                        <Text className="text-base text-foreground">
                            Discover
                        </Text>
                        <Text className="text-base text-muted-foreground">
                            Filter
                        </Text>
                    </RowView>

                    <ColView className="px-4 gap-2">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <Card key={i} className="h-32" />
                        ))}
                    </ColView>
                </ColView>
            </ColView>
        </ScrollView>
    );
}
