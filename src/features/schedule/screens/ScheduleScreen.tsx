import { ColView } from "@/shared/components/CustomView";
import SafeScreen from "@/shared/components/SafeScreen";
import { useState } from "react";
import { RefreshControl, ScrollView } from "react-native";
import AddScheduleButton from "../components/AddScheduleButton";
import ScheduleHeader from "../components/ScheduleHeader";
import ScheduleList from "../components/ScheduleList";

export default function ScheduleScreen() {
    const [isRefreshing, setIsRefreshing] = useState(false);

    const refresh = async () => {};
    return (
        <SafeScreen>
            <ColView className="flex-1 relative">
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
                    <ColView className=" flex-1 pb-28 gap-0">
                        <ScheduleHeader />
                        <ScheduleList />
                    </ColView>
                </ScrollView>
                <AddScheduleButton />
            </ColView>
        </SafeScreen>
    );
}
