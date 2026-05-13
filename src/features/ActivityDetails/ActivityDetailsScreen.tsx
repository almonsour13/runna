import { ColView } from "@/shared/components/CustomView";
import SafeScreen from "@/shared/components/SafeScreen";
import { ScrollView } from "react-native";
import ActivityAbout from "./Components/ActivityAbout";
import ActivityHighlights from "./Components/ActivityDetailsHighlights";
import ActivityDetailsMap from "./Components/ActivityDetailsMap";
import ActivitySplits from "./Components/ActivityDetailsSplits";
import ActivitySummary from "./Components/ActivityDetailsSummary";
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
                    <ColView className="relative flex-1 gap-4 pt-4">
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
