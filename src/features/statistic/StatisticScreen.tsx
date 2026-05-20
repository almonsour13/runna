import { ColView } from "@/shared/components/CustomView";
import { ScrollView } from "react-native";
import StatisticBar from "./components/StatisticBar";
import StatisticHeader from "./components/StatisticHeader";
import StatisticSummary from "./components/StatisticSummary";
import StatisticTabs from "./components/StatisticTabs";
import { StatisticProvider } from "./context/StatisticContext";

export default function StatisticScreen() {
    return (
        <StatisticProvider>
            <ScrollView showsVerticalScrollIndicator={false}>
                <ColView className="flex-1 gap-4 pb-28">
                    <StatisticHeader />
                    <StatisticTabs />
                    <StatisticBar />
                    <StatisticSummary />
                </ColView>
            </ScrollView>
        </StatisticProvider>
    );
}
