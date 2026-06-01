import { cn } from "@/shared/utils/cn";
import { useNavigation } from "@react-navigation/native";
import { useRef } from "react";
import { TouchableOpacity, View } from "react-native";
import ActivityTypeDrawer from "../../../shared/components/drawer/ActivityTypeDrawer";
import Card from "../../../shared/components/ui/Card";
import { DrawerHandle } from "../../../shared/components/ui/Drawer";
import Icon from "../../../shared/components/ui/Icon";
import Text from "../../../shared/components/ui/Text";
import { useRecordStore } from "../../../shared/stores/use-record.store";
import { ActivityType, NavigationProp } from "../../../shared/types/type";
import { formatDurationHHMMSS } from "../../../shared/utils/format";
import AnimatedActiveButtonIndicator from "./AnimatedActiveButtonIndicator";

export default function RecordButton() {
    const navigation = useNavigation<NavigationProp>();
    const activityTypeDrawer = useRef<DrawerHandle>(null);
    const duration = useRecordStore((s) => s.duration);
    const time = formatDurationHHMMSS(duration);
    const status = useRecordStore((s) => s.status);
    const isIdle = status === "idle";
    const isActive = status === "active";
    const isPaused = status === "paused";

    const icon = isIdle ? "footsteps" : isActive ? "pause" : "play";

    return (
        <>
            <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => {
                    // if (isIdle) {
                    //     activityTypeDrawer.current?.open();
                    // } else {
                    navigation.navigate("Record", {
                        type: "run",
                    });
                    // }
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
                            fill="current"
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
                    navigation.navigate("Record", {
                        type: type as ActivityType,
                    });
                }}
            />
        </>
    );
}
