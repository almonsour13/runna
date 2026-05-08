import { ColView } from "@/shared/components/CustomView";
import { ScrollView } from "react-native";
import HomeHeader from "./components/layout/HomeHeader";
import RecentActivities from "./components/RecentActivity";
import TodayActivity from "./components/TodayActivity";
import WeekActivity from "./components/WeekActivity";

export default function HomeScreen() {
    return (
        <ScrollView showsVerticalScrollIndicator={false}>
            <ColView className="flex-1 gap-4 pb-28">
                <HomeHeader />
                <WeekActivity />
                <TodayActivity />
                <RecentActivities />
            </ColView>
        </ScrollView>
    );
}
