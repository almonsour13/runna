import AnimatedActiveButtonIndicator from "@/shared/components/AnimatedActiveButtonIndicator";
import { ColView, RowView } from "@/shared/components/CustomView";
import Card from "@/shared/components/ui/Card";
import { useAcitivityTrackingController } from "@/shared/hooks/use-activity-tracking-controller";
import { useActivityTrackingStore } from "@/shared/stores/use-activity-tracking.store";
import { cn } from "@/shared/utils/cn";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useEffect, useMemo, useRef } from "react";
import { ActivityIndicator, Animated, TouchableOpacity } from "react-native";

export default function ActivityTrackingController() {
    const { start, resume, pause, stop, reset } =
        useAcitivityTrackingController();
    const status = useActivityTrackingStore((s) => s.status);
    const coordinates = useActivityTrackingStore((s) => s.coordinates);
    const previewCoordinate = useActivityTrackingStore(
        (s) => s.previewCoordinate,
    );
    const currentLocation = useMemo(
        () => coordinates[coordinates.length - 1] ?? previewCoordinate,
        [coordinates, previewCoordinate],
    );
    const isIdle = status === "idle";
    const isActive = status === "active";
    const isPaused = status === "paused";

    const mainAction = () => {
        switch (status) {
            case "idle":
                start();
                break;
            case "active":
                pause();
                break;
            case "paused":
                resume();
                break;

            default:
                break;
        }
    };
    const mainIcon = isActive ? "pause" : isPaused ? "play" : "play";
    const isDisable = isIdle || isActive;
    const opacity = isDisable && "opacity-0";

    const resetScale = useRef(new Animated.Value(isDisable ? 0 : 1)).current;
    const resetOpacity = useRef(new Animated.Value(isDisable ? 0 : 1)).current;

    const stopScale = useRef(new Animated.Value(isDisable ? 0 : 1)).current;
    const stopOpacity = useRef(new Animated.Value(isDisable ? 0 : 1)).current;

    useEffect(() => {
        const toValue = isDisable ? 0 : 1;

        const animate = (scale: Animated.Value, opacity: Animated.Value) => {
            Animated.parallel([
                Animated.spring(scale, {
                    toValue: isDisable ? 0.5 : 1,
                    useNativeDriver: true,
                }),
                Animated.timing(opacity, {
                    toValue,
                    duration: 180,
                    useNativeDriver: true,
                }),
            ]).start();
        };

        animate(resetScale, resetOpacity);
        animate(stopScale, stopOpacity);
    }, [isDisable]);

    return (
        <ColView className="py-4 gap-4">
            <RowView className="px-4 items-center justify-center">
                <Animated.View
                    style={{
                        transform: [{ scale: resetScale }],
                        opacity: resetOpacity,
                    }}
                >
                    <TouchableOpacity disabled={isDisable} onPress={reset}>
                        <Card className="h-16 aspect-square bg-card items-center justify-center">
                            <Ionicons
                                name="refresh"
                                size={24}
                                className="text-foreground"
                            />
                        </Card>
                    </TouchableOpacity>
                </Animated.View>
                <TouchableOpacity
                    disabled={!currentLocation}
                    className=""
                    onPress={mainAction}
                >
                    <Card
                        className={cn(
                            "relative h-16 aspect-square bg-primary  items-center justify-center",
                            !currentLocation && "opacity-50",
                        )}
                    >
                        {!currentLocation ? (
                            <ActivityIndicator />
                        ) : (
                            <Ionicons
                                name={mainIcon as any}
                                size={24}
                                className="text-white"
                            />
                        )}

                        <AnimatedActiveButtonIndicator />
                    </Card>
                </TouchableOpacity>
                <Animated.View
                    style={{
                        transform: [{ scale: resetScale }],
                        opacity: resetOpacity,
                    }}
                >
                    <TouchableOpacity disabled={isDisable} onPress={stop}>
                        <Card className="h-16 aspect-square bg-card items-center justify-center">
                            <Ionicons
                                name="checkmark"
                                size={24}
                                className="text-foreground"
                            />
                        </Card>
                    </TouchableOpacity>
                </Animated.View>
            </RowView>
        </ColView>
    );
}
