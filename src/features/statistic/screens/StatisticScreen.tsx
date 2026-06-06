import { ColView, RowView } from "@/shared/components/CustomView";
import Text from "@/shared/components/ui/Text";
import { ScrollView } from "react-native";
import StatisticCaloriesTrend from "../components/StatisticCaloriesTrend";
import StatisticDistanceTrend from "../components/StatisticDistanceTrend";
import StatisticHeader from "../components/StatisticHeader";
import StatisticPaceTrend from "../components/StatisticPaceTrend";
import StatisticPersonalBests from "../components/StatisticPersonalBests";
import StatisticSummary from "../components/StatisticSummary";
import StatisticTabs from "../components/StatisticTabs";
import StatisticTypeDistribution from "../components/StatisticTypeDistribution";
import { StatisticProvider } from "../context/StatisticContext";

export default function StatisticScreen() {
    return (
        <StatisticProvider>
            <ScrollView showsVerticalScrollIndicator={false}>
                <ColView className="flex-1 gap-4 pb-28">
                    <StatisticHeader />
                    <StatisticTabs />
                    <StatisticSummary />
                    <ColView>
                        <ColView className="gap-1">
                            <RowView className="px-4 justify-between items-center">
                                <Text className="text-lg font-medium">
                                    Trends
                                </Text>
                            </RowView>
                            <StatisticDistanceTrend />
                            <StatisticCaloriesTrend />
                            <StatisticPaceTrend />
                        </ColView>
                    </ColView>
                    <StatisticTypeDistribution />
                    <StatisticPersonalBests />
                </ColView>
            </ScrollView>
        </StatisticProvider>
    );
}
