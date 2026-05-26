import { ColView } from "@/shared/components/CustomView";
import { useActivityMutations } from "@/shared/hooks/use-activity-mutation";
import { useState } from "react";
import { RefreshControl, ScrollView } from "react-native";
import HomeHeader from "./components/HomeHeader";
import RecentActivities from "./components/RecentActivity";
import TodayActivity from "./components/TodayActivity";
import TodaySchedule from "./components/TodaySchedule";
import WeekActivity from "./components/WeekActivity";

export default function HomeScreen() {
    const { invalidate } = useActivityMutations();
    const [isRefreshing, setIsRefreshing] = useState(false);

    const refresh = async () => {
        setIsRefreshing(true);
        try {
            await invalidate();
        } finally {
            setIsRefreshing(false);
        }
    };

    return (
        <ScrollView
            showsVerticalScrollIndicator={false}
            refreshControl={
                <RefreshControl refreshing={isRefreshing} onRefresh={refresh} />
            }
        >
            <ColView className="flex-1 gap-4 pb-28">
                <HomeHeader />
                <WeekActivity />
                <TodayActivity />
                <TodaySchedule />
                <RecentActivities />
            </ColView>
        </ScrollView>
    );
}
