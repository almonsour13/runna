import { useRecordController } from "@/features/record/hooks/use-record-controller";
import { ColView, RowView } from "@/shared/components/CustomView";
import Card from "@/shared/components/ui/Card";
import { DrawerHandle } from "@/shared/components/ui/Drawer";
import Icon from "@/shared/components/ui/Icon";
import Text from "@/shared/components/ui/Text";
import { useUnit } from "@/shared/hooks/use-unit";
import { useRecordStore } from "@/shared/stores/use-record.store";
import { useSettingsStore } from "@/shared/stores/use-settings-store";
import { cn } from "@/shared/utils/cn";
import { useMemo, useRef } from "react";
import { ActivityIndicator, Alert, TouchableOpacity } from "react-native";
import { useMapControlStore } from "../stores/use-map-control.store";

export default function RecordController() {
    const { start, resume, pause, stop, reset } = useRecordController();
    const status = useRecordStore((s) => s.status);
    const coordinates = useRecordStore((s) => s.coordinates);
    const previewCoordinate = useRecordStore((s) => s.previewCoordinate);
    const currentLocation = useMemo(
        () => coordinates[coordinates.length - 1] ?? previewCoordinate,
        [coordinates, previewCoordinate],
    );
    const preferences = useSettingsStore((s) => s.settings.preferences);
    const goal = preferences?.goal || 0;
    const unit = preferences?.unit;
    const isMapExpanded = useMapControlStore((s) => s.isMapExpanded);
    const setIsMapExpanded = useMapControlStore((s) => s.setIsMapExpanded);
    const goalDrawerRef = useRef<DrawerHandle>(null);

    const isIdle = status === "idle";
    const isActive = status === "active";
    const isPaused = status === "paused";

    const mainAction = async () => {
        switch (status) {
            case "idle":
                await start();
                break;
            case "active":
                await pause();
                break;
            case "paused":
                await resume();
                break;

            default:
                break;
        }
    };
    const handleReset = () => {
        Alert.alert(
            "Reset Activity",
            "Are you sure you want to reset? All progress will be lost.",
            [
                {
                    text: "Cancel",
                    style: "cancel",
                },
                {
                    text: "Reset",
                    style: "destructive",
                    onPress: async () => await reset(),
                },
            ],
        );
    };
    const mainIcon = isActive ? "pause" : isPaused ? "play" : "play";
    const isDisable = isIdle || isActive;
    const opacity = isDisable && "opacity-25";

    return (
        <ColView className="px-4 pb-4">
            <RowView className="">
                <TouchableOpacity
                    onPress={() => setIsMapExpanded(!isMapExpanded)}
                    className="flex-1"
                >
                    <Card className="h-10 items-center justify-center py-1.5 px-3">
                        <RowView className="gap-1.5 items-center">
                            <Icon
                                name={
                                    isMapExpanded
                                        ? "eye-off-outline"
                                        : "eye-outline"
                                }
                                size={14}
                                className="text-muted-foreground"
                            />
                            <Text className="text-base">
                                {isMapExpanded ? "Hide Map" : "Show Map"}
                            </Text>
                        </RowView>
                    </Card>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => goalDrawerRef.current?.open()}
                    className="flex-1"
                >
                    <Card className="h-10 items-center justify-center py-1.5 px-3">
                        <RowView className="gap-1.5 items-center">
                            <Icon
                                name="flag"
                                size={12}
                                className="text-primary"
                            />
                            <Text className="text-base ">
                                {useUnit(goal).value}
                            </Text>
                        </RowView>
                    </Card>
                </TouchableOpacity>
            </RowView>
            <RowView className="justify-between items-center">
                <TouchableOpacity
                    disabled={isDisable}
                    onPress={handleReset}
                    className={cn(opacity, "flex-1")}
                >
                    <Card className="h-16 gap-0  bg-card items-center justify-center">
                        <Icon
                            name="refresh"
                            size={28}
                            className="text-foreground"
                        />
                        <Text className="hidden text-[10px] text-muted-foreground">
                            Reset
                        </Text>
                    </Card>
                </TouchableOpacity>
                {/* </Animated.View> */}
                <TouchableOpacity
                    disabled={!currentLocation}
                    className="flex-1"
                    onPress={mainAction}
                >
                    <Card
                        className={cn(
                            "relative h-16 gap-0 bg-primary  items-center justify-center",
                            !currentLocation && "opacity-50",
                        )}
                    >
                        {!currentLocation ? (
                            <ActivityIndicator />
                        ) : (
                            <>
                                <Icon
                                    name={mainIcon}
                                    size={28}
                                    className="text-white"
                                />
                                <Text className="hidden text-[10px] text-white">
                                    {isActive
                                        ? "Pause"
                                        : isPaused
                                          ? "Resume"
                                          : "Start"}
                                </Text>
                            </>
                        )}

                        {/* <AnimatedActiveButtonIndicator /> */}
                    </Card>
                </TouchableOpacity>
                <TouchableOpacity
                    disabled={isDisable}
                    onPress={stop}
                    className={cn(opacity, "flex-1")}
                >
                    <Card className="h-18 gap-0 bg-card items-center justify-center">
                        <Icon
                            name="checkmark"
                            size={28}
                            className="text-foreground"
                        />
                        <Text className="hidden text-[10px] text-muted-foreground">
                            Finish
                        </Text>
                    </Card>
                </TouchableOpacity>
            </RowView>
        </ColView>
    );
}
