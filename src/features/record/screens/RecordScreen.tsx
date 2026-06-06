import { ColView } from "@/shared/components/CustomView";
import RecordController from "../components/RecordController";
import RecordHeader from "../components/RecordHeader";
import RecordSummary from "../components/RecordSummary";

import SafeScreen from "@/shared/components/SafeScreen";
import { useRecordStore } from "@/shared/stores/use-record.store";
import { RootStackParamList } from "@/shared/types/type";
import { RouteProp, useRoute } from "@react-navigation/native";
import { useEffect } from "react";
import RecordMap from "../components/RecordMap";
import { useRecordPreviewTracking } from "../hooks/use-record-preview-tracking";
import { useMapControlStore } from "../stores/use-map-control.store";

type RecordRouteProp = RouteProp<RootStackParamList, "Record">;

export default function RecordScreen() {
    useRecordPreviewTracking();
    const route = useRoute<RecordRouteProp>();
    const activityType = route.params?.type;
    const setActivityType = useRecordStore((s) => s.setActivityType);

    const isMapExpanded = useMapControlStore((s) => s.isMapExpanded);
    const setIsMapExpanded = useMapControlStore((s) => s.setIsMapExpanded);
    const isMapReady = useMapControlStore((s) => s.isMapReady);

    useEffect(() => {
        if (!activityType) return;
        setActivityType(activityType);
    }, [activityType]);

    return (
        <SafeScreen>
            <ColView className="relative flex-1 gap-0">
                <RecordHeader />
                <ColView className="relative flex-1 gap-4">
                    <RecordMap />
                    <RecordSummary />
                    <RecordController />
                </ColView>
            </ColView>
        </SafeScreen>
    );
}
