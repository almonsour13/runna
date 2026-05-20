import { ColView } from "@/shared/components/CustomView";
import SafeScreen from "@/shared/components/SafeScreen";
import { useState } from "react";
import { RefreshControl, ScrollView } from "react-native";
import AddScheduleButton from "./components/AddScheduleButton";
import ScheduleHeader from "./components/ScheduleHeader";
import ScheduleList from "./components/ScheduleList";

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
                <ColView className="relative flex-1 gap-4 pb-28">
                    <ScheduleHeader />
                    <ScheduleList />
                    <AddScheduleButton />
                </ColView>
            </ScrollView>
        </SafeScreen>
    );
}
