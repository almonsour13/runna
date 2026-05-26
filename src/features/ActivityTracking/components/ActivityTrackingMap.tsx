import { RowView } from "@/shared/components/CustomView";
import Text from "@/shared/components/ui/Text";
import { useMapStyle } from "@/shared/hooks/use-map-style";
import { useActivityTrackingStore } from "@/shared/stores/use-activity-tracking.store";
import { Camera, Map } from "@maplibre/maplibre-react-native";
import { useEffect, useMemo, useRef } from "react";
import { Animated, Easing } from "react-native";
import { useMapControlStore } from "../stores/use-map-control.store";
import MapControls from "./map/MapControls";
import MapRouteLayer from "./map/MapRouteLayer";
import MapStartMarker from "./map/MapStartMarker";
import MapUserTracker from "./map/MapUserTracker";

const MAP_HEIGHT = 340;
const DURATION = 380;

export default function ActivityTrackingMap() {
    const mapRef = useRef<React.ElementRef<typeof Map> | null>(null);
    const cameraRef = useRef<React.ElementRef<typeof Camera> | null>(null);
    const isMapExpanded = useMapControlStore((s) => s.isMapExpanded);
    const setIsMapExpanded = useMapControlStore((s) => s.setIsMapExpanded);
    const isFollowingUser = useMapControlStore((s) => s.isFollowingUser);
    const setIsFollowingUser = useMapControlStore((s) => s.setIsFollowingUser);
    const isMapReady = useMapControlStore((s) => s.isMapReady);
    const setIsMapReady = useMapControlStore((s) => s.setIsMapReady);
    const pitch = useMapControlStore((s) => s.pitch);

    const mapStyle = useMapStyle();
    const coordinates = useActivityTrackingStore((s) => s.coordinates);
    const previewCoordinate = useActivityTrackingStore(
        (s) => s.previewCoordinate,
    );
    const mode = useActivityTrackingStore((s) => s.mode);

    const animatedHeight = useRef(new Animated.Value(0)).current;
    const animatedOpacity = useRef(new Animated.Value(0)).current;
    const isFirstRender = useRef(true);

    const currentLocation = useMemo(
        () => coordinates[coordinates.length - 1] ?? previewCoordinate,
        [coordinates, previewCoordinate],
    );

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

    useEffect(() => {
        if (
            !currentLocation ||
            !isMapExpanded ||
            !isFollowingUser ||
            !isMapReady
        )
            return;
        cameraRef.current?.easeTo({
            center: [currentLocation.longitude, currentLocation.latitude],
            zoom: 17,
            duration: 500,
        });
    }, [currentLocation, isMapExpanded, isFollowingUser, isMapReady]);

    return (
        <>
            <Animated.View
                style={{
                    width: "100%",
                    height: animatedHeight,
                    opacity: animatedOpacity,
                    overflow: "hidden",
                    position: "relative",
                }}
            >
                <Map
                    ref={mapRef}
                    mapStyle={mapStyle}
                    style={{ width: "100%", height: MAP_HEIGHT }}
                    logo={false}
                    attribution={false}
                    compass={false}
                    onRegionIsChanging={(state) => {
                        if (state.nativeEvent.userInteraction) {
                            setIsFollowingUser(false);
                        }
                    }}
                    onDidFinishLoadingMap={() => setIsMapReady(true)}
                    className="relative"
                >
                    <Camera ref={cameraRef} duration={100} pitch={pitch} />
                    <MapStartMarker />
                    <MapRouteLayer />
                    <MapUserTracker />
                </Map>
                <MapControls cameraRef={cameraRef} />

                <RowView className="hidden absolute top-4 left-4">
                    <Text className="text-sm capitalize">{mode}</Text>
                </RowView>
            </Animated.View>
        </>
    );
}
