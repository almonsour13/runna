import { RowView } from "@/shared/components/CustomView";
import Text from "@/shared/components/ui/Text";
import { OPEN_FREE_MAP_STYLES } from "@/shared/constant/constant";
import { cn } from "@/shared/utils/cn";
import { Ionicons } from "@expo/vector-icons";
import {
    Camera,
    GeoJSONSource,
    Layer,
    Map,
    ViewAnnotation,
} from "@maplibre/maplibre-react-native";
import { useMemo, useRef, useState } from "react";
import { TouchableOpacity, View } from "react-native";
import { useActivityDetails } from "../context/ActivityDetailsContext";

const MAP_PADDING = 20;
export default function ActivityDetailsMap() {
    const { activity, splits } = useActivityDetails();
    const coordinates = activity.coordinates;
    const cameraRef = useRef<React.ElementRef<typeof Camera> | null>(null);

    const startPoint = coordinates[0];
    const endPoint = coordinates[coordinates.length - 1];

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

    const [isKmMarkersVisible, setIsKmMarkersVisible] = useState(true);
    const kmMarkers = splits.map((s) => ({ km: s.km, coord: s.coord }));

    const fitBounds = () => {
        if (!bounds) return;
        cameraRef.current?.fitBounds(
            [bounds[0], bounds[1], bounds[2], bounds[3]], // [west, south, east, north]
            {
                padding: {
                    top: MAP_PADDING,
                    right: MAP_PADDING,
                    bottom: MAP_PADDING,
                    left: MAP_PADDING,
                },
            },
            500,
        );
    };

    return (
        <View className="h-68 relative">
            <Map
                mapStyle={OPEN_FREE_MAP_STYLES[4].style}
                logo={false}
                attribution={false}
                compass={false}
            >
                {bounds && (
                    <Camera
                        ref={cameraRef}
                        initialViewState={{
                            bounds,
                            padding: {
                                top: MAP_PADDING,
                                bottom: MAP_PADDING,
                                left: MAP_PADDING,
                                right: MAP_PADDING,
                            },
                        }}
                        padding={{
                            top: MAP_PADDING,
                            bottom: MAP_PADDING,
                            left: MAP_PADDING,
                            right: MAP_PADDING,
                        }}
                    />
                )}

                {coordinates.length >= 2 && (
                    <GeoJSONSource id="route-source" data={geoJson}>
                        <Layer
                            type="line"
                            style={{
                                lineColor: "#02a963",
                                lineWidth: 8,
                                lineJoin: "round",
                                lineCap: "round",
                                lineOpacity: 0.3,
                            }}
                        />
                        <Layer
                            type="line"
                            style={{
                                lineColor: "#02a963",
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

                {isKmMarkersVisible &&
                    kmMarkers.map(({ km, coord }) => (
                        <ViewAnnotation
                            key={km}
                            id={`km-${km}`}
                            lngLat={[coord.longitude, coord.latitude]}
                        >
                            <View className="h-5 w-5 rounded-full bg-card justify-center items-center">
                                <Text className="text-[8px]">{km}</Text>
                            </View>
                        </ViewAnnotation>
                    ))}
            </Map>

            <RowView className="absolute right-4 bottom-4 gap-2">
                <TouchableOpacity
                    className="h-8 aspect-square rounded-full bg-card justify-center items-center"
                    onPress={fitBounds}
                >
                    <Ionicons
                        name="scan-outline"
                        size={12}
                        className="text-foreground"
                    />
                </TouchableOpacity>

                <TouchableOpacity
                    className={cn(
                        "h-8 aspect-square rounded-full bg-card justify-center items-center",
                        // isKmMarkersVisible && "bg-primary",
                    )}
                    onPress={() => setIsKmMarkersVisible((prev) => !prev)}
                >
                    <Ionicons
                        name="flag"
                        size={12}
                        className={cn(
                            "text-foreground",
                            isKmMarkersVisible && "text-primary",
                        )}
                    />
                </TouchableOpacity>
            </RowView>
        </View>
    );
}
