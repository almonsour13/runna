import Card from "@/shared/components/ui/Card";
import { useRecordStore } from "@/shared/stores/use-record.store";
import { Marker } from "@maplibre/maplibre-react-native";
import { useEffect, useMemo, useRef, useState } from "react";
import { Animated, Easing, View } from "react-native";

export default function MapUserTracker() {
    const coordinates = useRecordStore((s) => s.coordinates);
    const previewCoordinate = useRecordStore((s) => s.previewCoordinate);
    const currentLocation = useMemo(
        () => coordinates[coordinates.length - 1] ?? previewCoordinate,
        [coordinates, previewCoordinate],
    );

    const animatedLng = useRef(
        new Animated.Value(currentLocation?.longitude ?? 0),
    ).current;
    const animatedLat = useRef(
        new Animated.Value(currentLocation?.latitude ?? 0),
    ).current;

    const [animatedCoordinate, setAnimatedCoordinate] = useState<
        [number, number]
    >([currentLocation?.longitude ?? 0, currentLocation?.latitude ?? 0]);

    useEffect(() => {
        // ✅ Fix: update the correct tuple index instead of spreading into an object
        const lngId = animatedLng.addListener(({ value }) => {
            setAnimatedCoordinate((prev) => [value, prev[1]]);
        });
        const latId = animatedLat.addListener(({ value }) => {
            setAnimatedCoordinate((prev) => [prev[0], value]);
        });

        return () => {
            animatedLng.removeListener(lngId);
            animatedLat.removeListener(latId);
        };
    }, []);

    useEffect(() => {
        if (!currentLocation) return;

        Animated.parallel([
            Animated.timing(animatedLng, {
                toValue: currentLocation.longitude,
                duration: 500,
                easing: Easing.linear,
                useNativeDriver: false,
            }),
            Animated.timing(animatedLat, {
                toValue: currentLocation.latitude,
                duration: 500,
                easing: Easing.linear,
                useNativeDriver: false,
            }),
        ]).start();
    }, [currentLocation]);

    const pingScale = useRef(new Animated.Value(1)).current;
    const pingOpacity = useRef(new Animated.Value(0.6)).current;

    useEffect(() => {
        // ✅ Fix: use a sequence to reset values before each iteration
        const ping = Animated.loop(
            Animated.sequence([
                Animated.parallel([
                    Animated.timing(pingScale, {
                        toValue: 2,
                        duration: 1000,
                        easing: Easing.out(Easing.ease),
                        useNativeDriver: true,
                    }),
                    Animated.timing(pingOpacity, {
                        toValue: 0,
                        duration: 1000,
                        easing: Easing.out(Easing.ease),
                        useNativeDriver: true,
                    }),
                ]),
                // Reset values instantly before the next loop iteration
                Animated.parallel([
                    Animated.timing(pingScale, {
                        toValue: 1,
                        duration: 0,
                        useNativeDriver: true,
                    }),
                    Animated.timing(pingOpacity, {
                        toValue: 0.6,
                        duration: 0,
                        useNativeDriver: true,
                    }),
                ]),
            ]),
        );

        ping.start();
        return () => ping.stop();
    }, []);

    if (!currentLocation) return null;

    return (
        <Marker id="user-location" lngLat={animatedCoordinate}>
            <View className="relative h-8 w-8  justify-center items-center">
                <View className="h-5 w-5 border-2 border-white rounded-full bg-blue-500" />

                <Animated.View
                    style={{
                        transform: [{ scale: pingScale }],
                        opacity: pingOpacity,
                    }}
                    className=" absolute inset-0"
                >
                    <Card className="flex-1  bg-blue-500 rounded-full" />
                </Animated.View>
            </View>
        </Marker>
    );
}
