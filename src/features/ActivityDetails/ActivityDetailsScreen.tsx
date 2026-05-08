import { ColView } from "@/shared/components/CustomView";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ActivityAbout from "./Components/ActivityAbout";
import ActivityHighlights from "./Components/ActivityHighlights";
import ActivityPace from "./Components/ActivityPace";
import ActivityRouteMap from "./Components/ActivityRouteMap";
import ActivitySplits from "./Components/ActivitySplits";
import ActivitySummary from "./Components/ActivitySummary";
import ActivityDetailsHeader from "./Components/layout/ActivityDetailsHeader";
import ActivityDetailsProvider from "./context/ActivityDetailsContext";

//running app
export default function ActivityDetailsScreen() {
    return (
        <ActivityDetailsProvider>
            <SafeAreaView style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                    <ColView className="flex-1 gap-8 ">
                        <ActivityDetailsHeader />
                        <ActivityRouteMap />
                        <ColView className="gap-4">
                            <ActivitySummary />
                            <View className="mx-4 border-b border-border/40" />
                            <ActivityPace />
                            <View className="mx-4 border-b border-border/40" />
                            <ActivityHighlights />
                            <ActivitySplits />
                            <ActivityAbout />
                        </ColView>
                    </ColView>
                </ScrollView>
            </SafeAreaView>
        </ActivityDetailsProvider>
    );
}
