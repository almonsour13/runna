import { cn } from "@/shared/utils/cn";
import { useNavigation } from "@react-navigation/native";
import { useRef } from "react";
import { TouchableOpacity, View } from "react-native";
import { useActivityTrackingStore } from "../stores/use-activity-tracking.store";
import { NavigationProp } from "../types/type";
import { formatDurationHHMMSS } from "../utils/format";
import AnimatedActiveButtonIndicator from "./AnimatedActiveButtonIndicator";
import ActivityTypeDrawer from "./drawer/ActivityTypeDrawer";
import Icon from "./Icon";
import Card from "./ui/Card";
import { DrawerHandle } from "./ui/Drawer";
import Text from "./ui/Text";

export default function ActivityButton() {
    const navigation = useNavigation<NavigationProp>();
    const activityTypeDrawer = useRef<DrawerHandle>(null);
    const duration = useActivityTrackingStore((s) => s.duration);
    const time = formatDurationHHMMSS(duration);
    const status = useActivityTrackingStore((s) => s.status);
    const isIdle = status === "idle";
    const isActive = status === "active";
    const isPaused = status === "paused";

    const icon = isIdle ? "footsteps" : isActive ? "pause" : "play";

    return (
        <>
            <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => {
                    if (isIdle) {
                        activityTypeDrawer.current?.open();
                    } else {
                        navigation.navigate("ActivityTracking" as never);
                    }
                }}
            >
                <Card
                    className={cn(
                        "relative bg-primary h-16 aspect-square justify-center items-center ",
                    )}
                >
                    <View className="absolute justify-between items-center">
                        <Icon
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
            <ActivityTypeDrawer
                ref={activityTypeDrawer}
                onChange={(type) => {
                    navigation.navigate("ActivityTracking", {
                        type: type,
                    });
                }}
            />
        </>
    );
}
