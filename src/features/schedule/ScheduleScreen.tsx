import { ColView } from "@/shared/components/CustomView";
import SafeScreen from "@/shared/components/SafeScreen";
import Card from "@/shared/components/ui/Card";
import { cn } from "@/shared/utils/cn";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { RefreshControl, ScrollView, TouchableOpacity } from "react-native";
import ScheduleHeader from "./components/ScheduleHeader";
export default function ScheduleScreen() {
    const [isRefreshing, setIsRefreshing] = useState(false);

    const refresh = async () => {};

    return (
        <SafeScreen>
            <ScrollView
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefreshing}
                        onRefresh={refresh}
                    />
                }
                contentContainerStyle={{
                    flexGrow: 1,
                }}
            >
                <ColView className="relative flex-1 gap-4 pb-28 bg-amber-50">
                    <ScheduleHeader />
                    <TouchableOpacity className="absolute bottom-4 right-4">
                        <Card
                            className={cn(
                                "relative bg-primary h-16 aspect-square justify-center items-center ",
                            )}
                        >
                            <Ionicons
                                name="add"
                                size={24}
                                className="text-white"
                            />
                        </Card>
                    </TouchableOpacity>
                </ColView>
            </ScrollView>
        </SafeScreen>
    );
}
