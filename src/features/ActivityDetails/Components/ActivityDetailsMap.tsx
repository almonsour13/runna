import { RowView } from "@/shared/components/CustomView";
import Text from "@/shared/components/ui/Text";
import { useMapStyle } from "@/shared/hooks/use-map-style";
import { Coordinate } from "@/shared/types/type";
import { cn } from "@/shared/utils/cn";
import { Ionicons } from "@expo/vector-icons";
import {
    Camera,
    GeoJSONSource,
    Layer,
    Map,
    Marker,
} from "@maplibre/maplibre-react-native";
import { useMemo, useRef, useState } from "react";
import { TouchableOpacity, View } from "react-native";
import { KmSplits } from "../ActivityDetailsScreen";

const MAP_PADDING = 20;
export default function ActivityDetailsMap({
    kmSplits,
    coordinates,
}: {
    kmSplits: KmSplits;
    coordinates: Coordinate[];
}) {
    const cameraRef = useRef<React.ElementRef<typeof Camera> | null>(null);
    const [isMapReady, setIsMapReady] = useState(false);
    const [isKmMarkersVisible, setIsKmMarkersVisible] = useState(true);
    const mapStyle = useMapStyle();

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

    const kmMarkers = useMemo(
        () => kmSplits.map((s) => ({ km: s.km, coord: s.coord })),
        [kmSplits],
    );

    if (!coordinates.length) return null;

    const startPoint = coordinates[0];
    const endPoint = coordinates[coordinates.length - 1];

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
                duration: 500,
            },
        );
    };

    return (
        <View
            style={{
                height: coordinates.length ? undefined : 0,
                overflow: "hidden",
            }}
            className="h-80 relative"
        >
            <Map
                mapStyle={mapStyle}
                logo={false}
                attribution={false}
                compass={false}
                onDidFinishLoadingMap={() => setIsMapReady(true)}
                className="relative"
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
                                lineWidth: 4,
                                lineJoin: "round",
                                lineCap: "round",
                                lineOpacity: 1,
                            }}
                        />
                    </GeoJSONSource>
                )}

                {startPoint && (
                    <Marker
                        id="start-point"
                        lngLat={[startPoint.longitude, startPoint.latitude]}
                    >
                        <View className="h-5 w-5 border-2 border-white rounded-full bg-green-600" />
                    </Marker>
                )}
                {endPoint && (
                    <Marker
                        id="end-point"
                        lngLat={[endPoint.longitude, endPoint.latitude]}
                    >
                        <View className="h-5 w-5 border-2 border-white rounded-full bg-red-600" />
                    </Marker>
                )}

                {isKmMarkersVisible &&
                    kmMarkers.map(({ km, coord }) => (
                        <Marker
                            key={km}
                            id={`km-${km}`}
                            lngLat={[coord.longitude, coord.latitude]}
                        >
                            <View className="h-5 w-5 rounded-full bg-card justify-center items-center border border-border/40">
                                <Text className="text-[8px] font-medium">
                                    {km}
                                </Text>
                            </View>
                        </Marker>
                    ))}
            </Map>

            <RowView className="absolute right-4 bottom-4 gap-2">
                <TouchableOpacity
                    className="h-8 aspect-square rounded-full bg-card justify-center items-center border border-border/40"
                    onPress={fitBounds}
                >
                    <Ionicons
                        name="scan-outline"
                        size={16}
                        className="text-foreground"
                    />
                </TouchableOpacity>
                <TouchableOpacity
                    className={cn(
                        "h-8 aspect-square rounded-full bg-card justify-center items-center border border-border/40",
                        isKmMarkersVisible && "bg-primary",
                    )}
                    onPress={() => setIsKmMarkersVisible((prev) => !prev)}
                >
                    <Ionicons
                        name="flag"
                        size={16}
                        className={cn("text-white")}
                    />
                </TouchableOpacity>
            </RowView>
        </View>
    );
}
