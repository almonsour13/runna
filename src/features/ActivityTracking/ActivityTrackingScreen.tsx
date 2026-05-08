import { ColView } from "@/shared/components/CustomView";
import { useActivityTrackingStore } from "@/shared/stores/use-activity-tracking.store";
import { SafeAreaView } from "react-native-safe-area-context";
import ActivityTrackingController from "./components/ActivityTrackingController";
import ActivityTrackingHeader from "./components/ActivityTrackingHeader";
import ActivityTrackingMap from "./components/ActivityTrackingMap";
import ActivityTrackingSummary from "./components/ActivityTrackingSummary";

export default function ActivityTrackingScreen() {
    const isMapExpanded = useActivityTrackingStore((s) => s.isMapExpanded);
    return (
        <SafeAreaView style={{ flex: 1 }}>
            <ColView className="flex-1 gap-8">
                <ActivityTrackingHeader />
                <ColView className="relative flex-1 ">
                    <ActivityTrackingSummary />
                    <ActivityTrackingMap />
                </ColView>
                <ActivityTrackingController />
            </ColView>
        </SafeAreaView>
    );
}
