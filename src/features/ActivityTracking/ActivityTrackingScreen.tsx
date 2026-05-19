import { ColView } from "@/shared/components/CustomView";
import ActivityTrackingController from "./components/ActivityTrackingController";
import ActivityTrackingHeader from "./components/ActivityTrackingHeader";
import ActivityTrackingSummary from "./components/ActivityTrackingSummary";

import SafeScreen from "@/shared/components/SafeScreen";
import { useActivityPreviewTracking } from "@/shared/hooks/use-activity-preview-tracking";
import ActivityTrackingMap from "./components/ActivityTrackingMap";

export default function ActivityTrackingScreen() {
    useActivityPreviewTracking();
    return (
        <SafeScreen>
            <ColView className="relative flex-1 gap-4">
                <ActivityTrackingHeader />
                <ColView className="relative flex-1 gap-4">
                    <ActivityTrackingSummary />
                    <ActivityTrackingMap />
                </ColView>
                <ActivityTrackingController />
            </ColView>
        </SafeScreen>
    );
}
