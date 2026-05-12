import { ColView } from "@/shared/components/CustomView";
import SafeScreen from "@/shared/components/SafeScreen";
import { ScrollView } from "react-native";
import ActivityDetailsMap from "./Components/ActivityDetailsMap";
import ActivitySummary from "./Components/ActivitySummary";
import ActivityDetailsHeader from "./Components/layout/ActivityDetailsHeader";
import ActivityDetailsProvider from "./context/ActivityDetailsContext";

export default function ActivityDetailsScreen() {
    return (
        <ActivityDetailsProvider>
            <SafeScreen>
                <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                    <ColView className="flex-1 gap-4">
                        <ActivityDetailsHeader />
                        <ActivityDetailsMap />
                        <ActivitySummary />
                    </ColView>
                </ScrollView>
            </SafeScreen>
        </ActivityDetailsProvider>
    );
}
