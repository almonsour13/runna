import { ColView } from "@/shared/components/CustomView";
import ActivityTrackingController from "./components/ActivityTrackingController";
import ActivityTrackingHeader from "./components/ActivityTrackingHeader";
import ActivityTrackingMap from "./components/ActivityTrackingMap";
import ActivityTrackingSummary from "./components/ActivityTrackingSummary";

import SafeScreen from "@/shared/components/SafeScreen";

export default function ActivityTrackingScreen() {
    return (
        <SafeScreen>
            <ColView className="flex-1 gap-8">
                <ActivityTrackingHeader />
                <ColView className="relative flex-1">
                    <ActivityTrackingSummary />
                    <ActivityTrackingMap />
                </ColView>
                <ActivityTrackingController />
            </ColView>
        </SafeScreen>
    );
}
