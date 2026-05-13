import { ColView, RowView } from "@/shared/components/CustomView";
import Card from "@/shared/components/ui/Card";
import Text from "@/shared/components/ui/Text";
import { OPEN_FREE_MAP_STYLES } from "@/shared/constant/constant";
import { useActivityTrackingStore } from "@/shared/stores/use-activity-tracking.store";
import { cn } from "@/shared/utils/cn";
import { capitalize } from "@/shared/utils/utils";
import { Ionicons } from "@expo/vector-icons";
import {
    Camera,
    GeoJSONSource,
    Layer,
    Map,
    ViewAnnotation,
} from "@maplibre/maplibre-react-native";
import { useEffect, useMemo, useRef, useState } from "react";
import { Animated, Easing, TouchableOpacity, View } from "react-native";

const MAP_HEIGHT = 270;
const DURATION = 380;

export default function ActivityTrackingMap() {
    const [isMapExpanded, setIsMapExpanded] = useState(false);
    const coordinates = useActivityTrackingStore((s) => s.coordinates);
    const previewCoordinate = useActivityTrackingStore(
        (s) => s.previewCoordinate,
    );
    const label = useActivityTrackingStore((s) => s.label);
    const mode = useActivityTrackingStore((s) => s.mode);
    const [isFollowing, setIsFollowing] = useState(true);

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
        if (!currentLocation || !isMapExpanded || !isFollowing) return;

        cameraRef.current?.setStop({
            center: [currentLocation.longitude, currentLocation.latitude],
            zoom: 17,
            duration: 300,
        });
    }, [currentLocation, isMapExpanded, isFollowing]);

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

    const fitRoute = () => {
        if (coordinates.length < 2) return;
        setIsFollowing(false);

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

        cameraRef.current?.fitBounds(
            [
                west - lngPadding,
                south - latPadding,
                east + lngPadding,
                north + latPadding,
            ],
            {
                padding: {
                    top: 40,
                    right: 40,
                    bottom: 40,
                    left: 40,
                },
            },
            500,
        );
    };

    const recenter = () => {
        if (!currentLocation) return;
        setIsFollowing(true); // re-enables auto-follow

        cameraRef.current?.flyTo({
            center: [currentLocation.longitude, currentLocation.latitude],
            zoom: 17,
            duration: 400,
        });
    };
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
                    onRegionIsChanging={(state) => {
                        if (state.nativeEvent.userInteraction) {
                            setIsFollowing(false);
                        }
                    }}
                >
                    <Camera ref={cameraRef} zoom={17} />

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
                            <View className="h-7 w-7 rounded-full bg-primary/50 justify-center items-center">
                                <View className="h-4 w-4 border border-white rounded-full bg-primary" />
                            </View>
                        </ViewAnnotation>
                    )}
                </Map>
                <ColView className="absolute right-4 bottom-4">
                    {/* Re-center on current location */}
                    <TouchableOpacity
                        className={cn(
                            "h-8 aspect-square rounded-full bg-card justify-center items-center",
                            isFollowing && "bg-primary",
                        )}
                        onPress={recenter}
                    >
                        <Ionicons
                            name="locate-outline"
                            size={12}
                            className="text-foreground"
                        />
                    </TouchableOpacity>

                    {coordinates.length >= 2 && (
                        <TouchableOpacity
                            className="h-8 aspect-square rounded-full bg-card justify-center items-center"
                            onPress={fitRoute}
                        >
                            <Ionicons
                                name="scan-outline"
                                size={12}
                                className="text-foreground"
                            />
                        </TouchableOpacity>
                    )}
                    <TouchableOpacity
                        className="hidden h-8 aspect-square rounded-full bg-card justify-center items-center"
                        onPress={() => {}}
                    >
                        <Ionicons
                            name="map-outline"
                            size={14}
                            className="text-foreground"
                        />
                    </TouchableOpacity>
                </ColView>
            </Animated.View>

            <RowView className="absolute bottom-4 right-4 left-4 justify-center items-center">
                <TouchableOpacity
                    onPress={() => setIsMapExpanded(!isMapExpanded)}
                >
                    <Card className="h-8 items-center justify-center py-1.5 px-3">
                        <Text className="text-xs">
                            {isMapExpanded ? "Hide Map" : "Show Map"}
                        </Text>
                    </Card>
                </TouchableOpacity>
            </RowView>
        </>
    );
}
