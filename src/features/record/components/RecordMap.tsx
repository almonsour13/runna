// RecordMap.tsx - bare minimum test
import { useMapStyle } from "@/shared/hooks/use-map-style";
import { useRecordStore } from "@/shared/stores/use-record.store";
import { Camera, Map } from "@maplibre/maplibre-react-native";
import { useMemo, useRef } from "react";
import { View } from "react-native";
import MapRouteLayer from "./map/MapRouteLayer";
import MapStartMarker from "./map/MapStartMarker";
import MapUserTracker from "./map/MapUserTracker";

export default function RecordMap() {
    const mapStyle = useMapStyle();
    const cameraRef = useRef<React.ElementRef<typeof Camera> | null>(null);
    const coordinates = useRecordStore((s) => s.coordinates);
    const previewCoordinate = useRecordStore((s) => s.previewCoordinate);

    const currentLocation = useMemo(
        () => coordinates[coordinates.length - 1] ?? previewCoordinate,
        [coordinates, previewCoordinate],
    );

    // useEffect(() => {
    //     if (!currentLocation) return;

    //     cameraRef.current?.easeTo({
    //         center: [currentLocation.longitude, currentLocation.latitude],
    //         zoom: 17,
    //         duration: 500,
    //     });
    // }, [currentLocation]);

    return (
        <View
            style={{
                width: "100%",
                height: 340,
                overflow: "hidden",
                position: "relative",
            }}
        >
            <Map
                mapStyle={mapStyle}
                style={{ flex: 1 }}
                logo={false}
                attribution={false}
                compass={false}
            >
                <Camera ref={cameraRef} />
                <MapStartMarker />
                <MapRouteLayer />
                <MapUserTracker />
            </Map>
        </View>
    );
}
