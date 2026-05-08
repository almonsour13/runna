import { ColView, RowView } from "@/shared/components/CustomView";
import Text from "@/shared/components/ui/Text";
import { computeSegmentIntensities } from "@/shared/utils/compute";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useMemo } from "react";
import { View } from "react-native";
import Svg, { Rect } from "react-native-svg";
import { useActivityDetails } from "../context/ActivityDetailsContext";

export default function ActivityPace() {
    const { activity } = useActivityDetails();
    const coordinates = activity.coordinates;
    const intensities = useMemo(
        () => computeSegmentIntensities(coordinates),
        [coordinates],
    );
    const W = 300;
    const H = 32;
    const segW = W / intensities.length;
    return (
        <ColView className="px-4 gap-2">
            <RowView className="justify-between items-center">
                <RowView className="gap-1 items-center">
                    <Ionicons
                        name="analytics-outline"
                        size={12}
                        className="text-primary"
                    />
                    <Text className="text-sm text-muted-foreground">
                        Pace Intensity
                    </Text>
                </RowView>
                <Text className="text-xs text-muted-foreground">
                    slow → fast
                </Text>
            </RowView>

            <View style={{ height: H, borderRadius: 8, overflow: "hidden" }}>
                <Svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`}>
                    {intensities.map((intensity, i) => (
                        <Rect
                            key={i}
                            x={i * segW}
                            y={0}
                            width={segW + 0.5}
                            height={H}
                            fill="#0F6E56"
                            opacity={0.12 + intensity * 0.78}
                        />
                    ))}
                </Svg>
            </View>
        </ColView>
    );
}
