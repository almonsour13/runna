import { ColView } from "@/shared/components/CustomView";
import { ScrollView } from "react-native";
import StatisticCaloriesTrend from "./components/StatisticCaloriesTrend";
import StatisticDistanceTrend from "./components/StatisticDistanceTrend";
import StatisticHeader from "./components/StatisticHeader";
import StatisticPersonalBests from "./components/StatisticPersonalBests";
import StatisticSummary from "./components/StatisticSummary";
import StatisticTabs from "./components/StatisticTabs";
import StatisticTypeBreakdown from "./components/StatisticTypeBreakdown";
import { StatisticProvider } from "./context/StatisticContext";

export default function StatisticScreen() {
    return (
        <StatisticProvider>
            <ScrollView showsVerticalScrollIndicator={false}>
                <ColView className="flex-1 gap-4 pb-28">
                    <StatisticHeader />
                    <StatisticTabs />
                    <StatisticSummary />
                    <StatisticPersonalBests />
                    <StatisticDistanceTrend />
                    <StatisticCaloriesTrend />
                    <StatisticTypeBreakdown />
                </ColView>
            </ScrollView>
        </StatisticProvider>
    );
}
