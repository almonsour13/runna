import { ColView } from "@/shared/components/CustomView";
import Card from "@/shared/components/ui/Card";
import { SafeAreaView } from "react-native-safe-area-context";
import ActivityTrackingController from "./components/ActivityTrackingController";
import ActivityTrackingHeader from "./components/ActivityTrackingHeader";
import ActivityTrackingSummary from "./components/ActivityTrackingSummary";

export default function ActivityTrackingScreen() {
    return (
        <SafeAreaView style={{ flex: 1 }}>
            <ColView className="flex-1 gap-8">
                <ActivityTrackingHeader />
                <ColView className="flex-1 justify-center items-center">
                    <ActivityTrackingSummary />
                    <Card className="hidden flex-1 w-full" />
                </ColView>
                <ActivityTrackingController />
            </ColView>
        </SafeAreaView>
    );
}
