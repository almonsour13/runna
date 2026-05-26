import { ColView, RowView } from "@/shared/components/CustomView";
import Icon from "@/shared/components/Icon";
import Text from "@/shared/components/ui/Text";
import { useActivityTrackingStore } from "@/shared/stores/use-activity-tracking.store";
import { useNavigation } from "@react-navigation/native";
import { useMemo } from "react";
import { TouchableOpacity } from "react-native";

export default function ActivityTrackingHeader() {
    const navigation = useNavigation();
    const coordinates = useActivityTrackingStore((s) => s.coordinates);
    const previewCoordinate = useActivityTrackingStore(
        (s) => s.previewCoordinate,
    );
    const currentLocation = useMemo(
        () => coordinates[coordinates.length - 1] ?? previewCoordinate,
        [coordinates, previewCoordinate],
    );
    const now = new Date();
    const date = now.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    });
    const gpsSignal = useMemo(() => {
        const accuracy = currentLocation?.accuracy ?? 0;

        if (!currentLocation) {
            return {
                label: "Acquiring...",
                color: "text-gray-400",
            };
        }

        if (accuracy <= 5) {
            return {
                label: "Excellent",
                color: "text-green-500",
            };
        }

        if (accuracy <= 15) {
            return {
                label: "Good",
                color: "text-lime-500",
            };
        }

        if (accuracy <= 30) {
            return {
                label: "Fair",
                color: "text-yellow-500",
            };
        }

        return {
            label: "Poor",
            color: "text-red-500",
        };
    }, [currentLocation]);

    return (
        <RowView className="p-4 justify-between  gap-4 items-center">
            <RowView className="gap-4 items-center">
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Icon
                        name="arrow-back"
                        size={24}
                        className="text-foreground"
                    />
                </TouchableOpacity>
            </RowView>
            <RowView className="hidden flex-1 justify-start items-center">
                <ColView className="gap-0 justify-center items-center">
                    <Text className="text-xl">Morning Walk</Text>
                    <Text className="hidden text-xs font-medium text-muted-foreground">
                        {date}
                    </Text>
                </ColView>
            </RowView>
            <RowView className="px-4 items-center justify-between gap-4">
                <RowView className="gap-1">
                    <Icon name="locate" />
                    <Text className="text-xs font-medium text-muted-foreground">
                        {coordinates.length} pts
                    </Text>
                </RowView>
                <RowView className="gap-1">
                    <Icon name="cellular" className={gpsSignal.color} />
                    <Text className="text-xs font-medium text-muted-foreground">
                        {gpsSignal.label}
                    </Text>
                </RowView>
            </RowView>
        </RowView>
    );
}
