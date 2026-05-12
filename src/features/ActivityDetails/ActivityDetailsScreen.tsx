import { ColView } from "@/shared/components/CustomView";
import SafeScreen from "@/shared/components/SafeScreen";
import { ScrollView } from "react-native";
import ActivityAbout from "./Components/ActivityAbout";
import ActivityDetailsMap from "./Components/ActivityDetailsMap";
import ActivityHighlights from "./Components/ActivityHighlights";
import ActivitySplits from "./Components/ActivitySplits";
import ActivitySummary from "./Components/ActivitySummary";
import ActivityDetailsHeader from "./Components/layout/ActivityDetailsHeader";
import ActivityDetailsProvider from "./context/ActivityDetailsContext";

export default function ActivityDetailsScreen() {
    return (
        <ActivityDetailsProvider>
            <SafeScreen>
                <ScrollView
                    contentContainerStyle={{ flexGrow: 1 }}
                    stickyHeaderIndices={[0]}
                >
                    <ActivityDetailsHeader />
                    <ColView className="relative flex-1 gap-8 pt-4">
                        <ActivitySummary />
                        <ActivityDetailsMap />
                        <ActivitySplits />
                        <ActivityHighlights />
                        <ActivityAbout />
                    </ColView>
                </ScrollView>
            </SafeScreen>
        </ActivityDetailsProvider>
    );
}
