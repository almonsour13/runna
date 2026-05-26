import { ColView, RowView } from "@/shared/components/CustomView";
import ActivityTrackingController from "./components/ActivityTrackingController";
import ActivityTrackingHeader from "./components/ActivityTrackingHeader";
import ActivityTrackingSummary from "./components/ActivityTrackingSummary";

import SafeScreen from "@/shared/components/SafeScreen";
import Card from "@/shared/components/ui/Card";
import Text from "@/shared/components/ui/Text";
import { useActivityPreviewTracking } from "@/shared/hooks/use-activity-preview-tracking";
import { useActivityTrackingStore } from "@/shared/stores/use-activity-tracking.store";
import { useMemo } from "react";
import { TouchableOpacity } from "react-native";
import ActivityTrackingMap from "./components/ActivityTrackingMap";
import { useMapControlStore } from "./stores/use-map-control.store";

export default function ActivityTrackingScreen() {
    useActivityPreviewTracking();
    const isMapExpanded = useMapControlStore((s) => s.isMapExpanded);
    const setIsMapExpanded = useMapControlStore((s) => s.setIsMapExpanded);
    const isMapReady = useMapControlStore((s) => s.isMapReady);
    const coordinates = useActivityTrackingStore((s) => s.coordinates);
    const previewCoordinate = useActivityTrackingStore(
        (s) => s.previewCoordinate,
    );
    const currentLocation = useMemo(
        () => coordinates[coordinates.length - 1] ?? previewCoordinate,
        [coordinates, previewCoordinate],
    );
    return (
        <SafeScreen>
            <ColView className="relative flex-1 gap-0">
                <ActivityTrackingHeader />
                <ColView className="relative flex-1 gap-4">
                    <ActivityTrackingMap />
                    <ActivityTrackingSummary />
                    {isMapReady && currentLocation && (
                        <RowView className="p-4 justify-center items-center">
                            <TouchableOpacity
                                onPress={() => setIsMapExpanded(!isMapExpanded)}
                            >
                                <Card className="h-8 items-center justify-center py-1.5 px-3">
                                    <Text className="text-xs">
                                        {isMapExpanded
                                            ? "Hide Map"
                                            : "Show Map"}
                                    </Text>
                                </Card>
                            </TouchableOpacity>
                        </RowView>
                    )}
                </ColView>
                <ActivityTrackingController />
            </ColView>
        </SafeScreen>
    );
}
