import { ColView, RowView } from "@/shared/components/CustomView";
import RecordController from "../components/RecordController";
import RecordHeader from "../components/RecordHeader";
import RecordSummary from "../components/RecordSummary";

import SafeScreen from "@/shared/components/SafeScreen";
import Card from "@/shared/components/ui/Card";
import Text from "@/shared/components/ui/Text";
import { useRecordStore } from "@/shared/stores/use-record.store";
import { RootStackParamList } from "@/shared/types/type";
import { RouteProp, useRoute } from "@react-navigation/native";
import { useEffect } from "react";
import { TouchableOpacity } from "react-native";
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
                <ColView className="relative flex-1">
                    {/* <RecordMap /> */}
                    <RecordSummary />
                    {isMapReady && (
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
                <RecordController />
            </ColView>
        </SafeScreen>
    );
}
