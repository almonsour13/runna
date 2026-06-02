// RecordMap.tsx - bare minimum test
import { useMapStyle } from "@/shared/hooks/use-map-style";
import { useRecordStore } from "@/shared/stores/use-record.store";
import { Camera, Map } from "@maplibre/maplibre-react-native";
import { useEffect, useMemo, useRef } from "react";
import { Animated, Easing, View } from "react-native";
import { useMapControlStore } from "../stores/use-map-control.store";
import MapControls from "./map/MapControls";
import MapRouteLayer from "./map/MapRouteLayer";
import MapStartMarker from "./map/MapStartMarker";
import MapUserTracker from "./map/MapUserTracker";

const MAP_HEIGHT = 340;
const DURATION = 500;

export default function RecordMap() {
    const mapStyleIndex = useMapControlStore((s) => s.mapStyleIndex);
    const mapStyle = useMapStyle(mapStyleIndex);
    const cameraRef = useRef<React.ElementRef<typeof Camera> | null>(null);
    const coordinates = useRecordStore((s) => s.coordinates);
    const previewCoordinate = useRecordStore((s) => s.previewCoordinate);

    const isMapExpanded = useMapControlStore((s) => s.isMapExpanded);
    const isFollowingUser = useMapControlStore((s) => s.isFollowingUser);
    const setIsFollowingUser = useMapControlStore((s) => s.setIsFollowingUser);
    const isMapReady = useMapControlStore((s) => s.isMapReady);
    const setIsMapReady = useMapControlStore((s) => s.setIsMapReady);
    const pitch = useMapControlStore((s) => s.pitch);

    const currentLocation = useMemo(
        () => coordinates[coordinates.length - 1] ?? previewCoordinate,
        [coordinates, previewCoordinate],
    );

    const animatedHeight = useRef(new Animated.Value(0)).current;
    const animatedOpacity = useRef(new Animated.Value(0)).current;
    const isFirstRender = useRef(true);

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
        if (!isMapReady || !currentLocation) return;

        cameraRef.current?.easeTo({
            center: [currentLocation.longitude, currentLocation.latitude],
            zoom: 17,
            duration: 500,
        });
    }, [isMapReady]); // ← only fires when map becomes ready

    // ✅ Follow user as location updates
    useEffect(() => {
        if (
            !currentLocation ||
            !isFollowingUser ||
            !isMapExpanded ||
            !isMapReady
        )
            return;

        cameraRef.current?.easeTo({
            center: [currentLocation.longitude, currentLocation.latitude],
            zoom: 17,
            duration: 500,
        });
    }, [currentLocation, isFollowingUser, isMapExpanded, isMapReady]);
    return (
        <>
            <View
                style={{
                    width: "100%",
                    height: MAP_HEIGHT,
                    overflow: "hidden",
                    position: "relative",
                }}
            >
                <Map
                    mapStyle={mapStyle}
                    style={{ flex: 1, height: MAP_HEIGHT }}
                    logo={false}
                    attribution={false}
                    compass={false}
                    onRegionIsChanging={(state) => {
                        if (state.nativeEvent.userInteraction) {
                            setIsFollowingUser(false);
                        }
                    }}
                    onDidFinishLoadingMap={() => setIsMapReady(true)}
                >
                    <Camera ref={cameraRef} duration={500} pitch={pitch} />
                    <MapStartMarker />
                    <MapRouteLayer />
                    <MapUserTracker />
                </Map>
                <MapControls cameraRef={cameraRef} />
            </View>
        </>
    );
}
