import { useEffect, useRef } from "react";
import { Animated } from "react-native";
import { useActivityTrackingStore } from "../stores/use-activity-tracking.store";
import Card from "./ui/Card";

export default function AnimatedActiveButtonIndicator() {
    const activity = useActivityTrackingStore((s) => s.activity);
    const status = activity.status;

    const isActive = status === "active";

    const pingScale = useRef(new Animated.Value(1)).current;
    const pingOpacity = useRef(new Animated.Value(0.6)).current;

    useEffect(() => {
        if (!isActive) {
            pingScale.setValue(1);
            pingOpacity.setValue(0.6);
            return;
        }

        const ping = Animated.loop(
            Animated.parallel([
                Animated.timing(pingScale, {
                    toValue: 1.5,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                Animated.timing(pingOpacity, {
                    toValue: 0,
                    duration: 1000,
                    useNativeDriver: true,
                }),
            ]),
        );

        ping.start();
        return () => ping.stop();
    }, [isActive]);

    if (!isActive) return null;
    return (
        <Animated.View
            style={{
                transform: [{ scale: pingScale }],
                opacity: pingOpacity,
            }}
            className="-z-10 absolute inset-0"
        >
            <Card className="flex-1 bg-primary" />
        </Animated.View>
    );
}
