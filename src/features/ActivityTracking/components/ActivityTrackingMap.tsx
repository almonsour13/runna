import { RowView } from "@/shared/components/CustomView";
import Card from "@/shared/components/ui/Card";
import Text from "@/shared/components/ui/Text";
import { useActivityTrackingStore } from "@/shared/stores/use-activity-tracking.store";
import { useEffect, useRef } from "react";
import { Animated, Easing, TouchableOpacity, View } from "react-native";

const MAP_HEIGHT = 320;
const DURATION = 380;

export default function ActivityTrackingMap() {
    const isMapExpanded = useActivityTrackingStore((s) => s.isMapExpanded);
    const setIsMapExpanded = useActivityTrackingStore(
        (s) => s.setIsMapExpanded,
    );
    const animatedHeight = useRef(new Animated.Value(0)).current;
    const animatedOpacity = useRef(new Animated.Value(0)).current;
    const isFirstRender = useRef(true);

    useEffect(() => {
        if (isFirstRender.current) {
            // Set the value instantly without animation
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

    const toggleMap = () => {
        setIsMapExpanded(!isMapExpanded);
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
                className="bg-red-100"
            >
                <View
                    className="bg-primary"
                    style={{ width: "100%", height: MAP_HEIGHT }}
                >
                    {/* Your map component here */}
                </View>
            </Animated.View>
            <RowView className="absolute bottom-4 right-4 left-4 justify-center items-center">
                <TouchableOpacity onPress={toggleMap}>
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
