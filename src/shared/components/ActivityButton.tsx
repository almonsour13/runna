import { cn } from "@/shared/utils/cn";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import { TouchableOpacity, View } from "react-native";
import { useActivityTrackingStore } from "../stores/use-activity-tracking.store";
import { formatDurationHHMMSS } from "../utils/format";
import AnimatedActiveButtonIndicator from "./AnimatedActiveButtonIndicator";
import Card from "./ui/Card";
import Text from "./ui/Text";

export default function ActivityButton() {
    const navigation = useNavigation();
    const activity = useActivityTrackingStore((s) => s.activity);
    const duration = activity.duration;
    const time = formatDurationHHMMSS(duration);
    const status = activity.status;
    const isIdle = status === "idle";
    const isActive = status === "active";
    const isPaused = status === "paused";

    const icon = isIdle ? "footsteps" : isActive ? "pause" : "play";

    return (
        <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => navigation.navigate("ActivityTracking" as never)}
        >
            <Card
                className={cn(
                    "relative bg-primary h-16 aspect-square justify-center items-center ",
                )}
            >
                <View className="absolute justify-between items-center">
                    <Ionicons
                        name={icon as any}
                        size={24}
                        className="text-white"
                    />
                </View>
                <AnimatedActiveButtonIndicator />
                {(isActive || isPaused) && (
                    <View className="absolute inset-1 justify-between items-center">
                        <View className="flex-1 justify-end items-center">
                            <Text className="text-[6px] text-white font-medium">
                                {time}
                            </Text>
                        </View>
                    </View>
                )}
            </Card>
        </TouchableOpacity>
    );
}
