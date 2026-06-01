// MapStartMarker.tsx
import { useRecordStore } from "@/shared/stores/use-record.store";
import { Marker } from "@maplibre/maplibre-react-native";
import { View } from "react-native";

export default function MapStartMarker() {
    const coordinates = useRecordStore((s) => s.coordinates);
    const startingPoint = coordinates[0];

    if (!startingPoint || coordinates.length < 2) return null;

    return (
        <Marker
            id="start-point"
            lngLat={[startingPoint.longitude, startingPoint.latitude]}
        >
            <View className="h-5 w-5 border-2 border-white rounded-full bg-primary" />
        </Marker>
    );
}
