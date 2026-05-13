import { RowView } from "@/shared/components/CustomView";
import Card from "@/shared/components/ui/Card";
import Text from "@/shared/components/ui/Text";
import { OPEN_FREE_MAP_STYLES } from "@/shared/constant/constant";
import { useActivityTrackingStore } from "@/shared/stores/use-activity-tracking.store";
import { capitalize } from "@/shared/utils/utils";
import {
    Camera,
    GeoJSONSource,
    Layer,
    Map,
    ViewAnnotation,
} from "@maplibre/maplibre-react-native";
import { useEffect, useMemo, useRef } from "react";
import { Animated, Easing, TouchableOpacity, View } from "react-native";

const MAP_HEIGHT = 270;
const DURATION = 380;

export default function ActivityTrackingMap() {
    const isMapExpanded = useActivityTrackingStore((s) => s.isMapExpanded);
    const setIsMapExpanded = useActivityTrackingStore(
        (s) => s.setIsMapExpanded,
    );
    const coordinates = useActivityTrackingStore((s) => s.coordinates);
    const previewCoordinate = useActivityTrackingStore(
        (s) => s.previewCoordinate,
    );
    const label = useActivityTrackingStore((s) => s.label);
    const mode = useActivityTrackingStore((s) => s.mode);

    const animatedHeight = useRef(new Animated.Value(0)).current;
    const animatedOpacity = useRef(new Animated.Value(0)).current;
    const isFirstRender = useRef(true);
    const mapRef = useRef<React.ElementRef<typeof Map> | null>(null);
    const cameraRef = useRef<React.ElementRef<typeof Camera> | null>(null);

    // Current location — last recorded coord or preview fallback
    const currentLocation = useMemo(
        () => coordinates[coordinates.length - 1] ?? previewCoordinate,
        [coordinates, previewCoordinate],
    );

    // Animate expand/collapse
    useEffect(() => {
        if (isFirstRender.current) {
            animatedHeight.setValue(isMapExpanded ? MAP_HEIGHT : 0);
            animatedOpacity.setValue(isMapExpanded ? 1 : 0);
            isFirstRender.current = false;
            return;
        }

        Animated.parallel([
            Animated.timing(animatedHeight, {
                toValue: isMapExpanded ? MAP_HEIGHT : 0,
                duration: DURATION,
                easing: isMapExpanded
                    ? Easing.out(Easing.cubic)
                    : Easing.in(Easing.cubic),
                useNativeDriver: false,
            }),
            Animated.timing(animatedOpacity, {
                toValue: isMapExpanded ? 1 : 0,
                duration: isMapExpanded ? DURATION : DURATION * 0.6,
                easing: Easing.out(Easing.quad),
                useNativeDriver: false,
            }),
        ]).start();
    }, [isMapExpanded]);

    // Follow user location with smooth animation
    useEffect(() => {
        if (!currentLocation || !isMapExpanded) return;

        cameraRef.current?.setStop({
            center: [currentLocation.longitude, currentLocation.latitude],
            zoom: 17,
            duration: 300,
        });
    }, [currentLocation, isMapExpanded]);

    // Memoize the computed GeoJSON separately
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

    const startingPoint = coordinates[0];
    const header = [capitalize(mode), label].join(" - ");
    return (
        <>
            <Animated.View
                style={{
                    width: "100%",
                    height: animatedHeight,
                    opacity: animatedOpacity,
                    overflow: "hidden",
                }}
                className="relative"
            >
                <Map
                    ref={mapRef}
                    mapStyle={OPEN_FREE_MAP_STYLES[4].style}
                    style={{ width: "100%", height: MAP_HEIGHT }}
                    logo={false}
                    attribution={false}
                    compass={false}
                >
                    <Camera
                        ref={cameraRef}
                        trackUserLocation="heading"
                        zoom={17}
                    />

                    {/* Route line — only renders when recording */}
                    {coordinates.length >= 2 && (
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
                    )}

                    {/* Current location pin — always shows */}
                    {currentLocation && (
                        <ViewAnnotation
                            id="user-location"
                            lngLat={[
                                currentLocation.longitude,
                                currentLocation.latitude,
                            ]}
                        >
                            <View className="h-4 w-4 border-2 border-white rounded-full bg-blue-600" />
                        </ViewAnnotation>
                    )}
                </Map>
            </Animated.View>

            <RowView className="absolute bottom-4 right-4 left-4 justify-center items-center">
                <TouchableOpacity
                    onPress={() => setIsMapExpanded(!isMapExpanded)}
                >
                    <Card className="py-2 px-4">
                        <Text className="text-sm">
                            {isMapExpanded ? "Hide Map" : "Show Map"}
                        </Text>
                    </Card>
                </TouchableOpacity>
            </RowView>
        </>
    );
}
