import { useRecordStore } from "@/shared/stores/use-record.store";
import { GeoJSONSource, Layer } from "@maplibre/maplibre-react-native";
import { useMemo } from "react";

export default function MapRouteLayer() {
    const coordinates = useRecordStore((s) => s.coordinates);

    // ✅ FIX: Only re-compute when coordinates length changes significantly (every 10 coords)
    // This prevents excessive re-renders when adding coordinates one-by-one
    const coordinateLength = coordinates.length;
    const memoizedLength = useMemo(
        () => Math.floor(coordinateLength / 10) * 10,
        [coordinateLength],
    );

    const routeData = useMemo(
        (): GeoJSON.Feature<GeoJSON.LineString> => ({
            type: "Feature",
            properties: {},
            geometry: {
                type: "LineString",
                coordinates: coordinates.map((c) => [c.longitude, c.latitude]),
            },
        }),
        [memoizedLength, coordinates],
    );

    if (coordinateLength < 2) return null;

    return (
        <GeoJSONSource id="route-source" data={routeData}>
            <Layer
                type="line"
                paint={{
                    "line-color": "#02a963",
                    "line-width": 4,
                    "line-opacity": 1,
                }}
                layout={{
                    "line-join": "round",
                    "line-cap": "round",
                }}
            />
        </GeoJSONSource>
    );
}
