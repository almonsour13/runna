import { OPEN_FREE_MAP_STYLES } from "@/shared/constant/constant";
import {
    Camera,
    GeoJSONSource,
    Layer,
    Map,
    ViewAnnotation,
} from "@maplibre/maplibre-react-native";
import { useMemo } from "react";
import { View } from "react-native";
import { useActivityDetails } from "../context/ActivityDetailsContext";

export default function ActivityDetailsMap() {
    const { activity } = useActivityDetails();
    const coordinates = activity.coordinates;

    const startPoint = coordinates[0];
    const endPoint = coordinates[coordinates.length - 1];
    const mid = coordinates[coordinates.length / 2];
    const geoJson = useMemo(
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

    const bounds = useMemo(() => {
        if (coordinates.length === 0) return null;

        let west = coordinates[0].longitude;
        let east = coordinates[0].longitude;
        let south = coordinates[0].latitude;
        let north = coordinates[0].latitude;

        for (const coord of coordinates) {
            west = Math.min(west, coord.longitude);
            east = Math.max(east, coord.longitude);

            south = Math.min(south, coord.latitude);
            north = Math.max(north, coord.latitude);
        }
        const lngPadding = Math.max((east - west) * 0.1, 0.001);
        const latPadding = Math.max((north - south) * 0.1, 0.001);

        return [
            west - lngPadding,
            south - latPadding,
            east + lngPadding,
            north + latPadding,
        ] as [number, number, number, number];
    }, [coordinates]);

    return (
        <View className="flex-1 aspect-video">
            <Map
                mapStyle={OPEN_FREE_MAP_STYLES[4].style}
                logo={false}
                attribution={false}
                compass={false}
            >
                {bounds && (
                    <Camera
                        initialViewState={{ bounds }}
                        padding={{
                            top: 40,
                            bottom: 40,
                            left: 40,
                            right: 40,
                        }}
                    />
                )}

                {coordinates.length >= 2 && (
                    <GeoJSONSource id="route-source" data={geoJson}>
                        <Layer
                            type="line"
                            style={{
                                lineColor: "#1d4ed8",
                                lineWidth: 8,
                                lineJoin: "round",
                                lineCap: "round",
                                lineOpacity: 0.3,
                            }}
                        />
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
                )}

                {startPoint && (
                    <ViewAnnotation
                        id="start-point"
                        lngLat={[startPoint.longitude, startPoint.latitude]}
                    >
                        <View className="h-4 w-4 border-2 border-white rounded-full bg-green-600" />
                    </ViewAnnotation>
                )}
                {endPoint && (
                    <ViewAnnotation
                        id="end-point"
                        lngLat={[endPoint.longitude, endPoint.latitude]}
                    >
                        <View className="h-4 w-4 border-2 border-white rounded-full bg-red-600" />
                    </ViewAnnotation>
                )}
            </Map>
        </View>
    );
}
