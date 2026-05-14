import { useActivityTrackingStore } from "@/shared/stores/use-activity-tracking.store";
import { GeoJSONSource, Layer } from "@maplibre/maplibre-react-native";
import { useMemo } from "react";

export default function MapRouteLayer() {
    const coordinates = useActivityTrackingStore((s) => s.coordinates);

    const routeData = useMemo(
        (): GeoJSON.Feature<GeoJSON.LineString> => ({
            type: "Feature",
            properties: {},
            geometry: {
                type: "LineString",
                coordinates: coordinates.map((c) => [c.longitude, c.latitude]),
            },
        }),
        [coordinates],
    );

    if (coordinates.length < 2) return null;

    return (
        <GeoJSONSource id="route-source" data={routeData}>
            <Layer
                type="line"
                style={{
                    lineColor: "#3b82f6",
                    lineWidth: 4,
                    lineJoin: "round",
                    lineCap: "round",
                }}
            />
        </GeoJSONSource>
    );
}
