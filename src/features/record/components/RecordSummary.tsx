import { ColView, RowView } from "@/shared/components/CustomView";
import GoalDrawer from "@/shared/components/drawer/GoalDrawer";
import Card from "@/shared/components/ui/Card";
import { DrawerHandle } from "@/shared/components/ui/Drawer";
import Icon from "@/shared/components/ui/Icon";
import Text from "@/shared/components/ui/Text";
import { settingsService } from "@/shared/services/storage/settings.service";
import { useProfileStore } from "@/shared/stores/use-profile.store";
import { useRecordStore } from "@/shared/stores/use-record.store";
import { useSettingsStore } from "@/shared/stores/use-settings-store";
import { cn } from "@/shared/utils/cn";
import { computeCalories, computeTotalDistance } from "@/shared/utils/compute";
import { convertMsToS } from "@/shared/utils/convert";
import {
    formatCalories,
    formatDistanceByUnit,
    formatDurationHHMMSS,
    formatPaceByUnit,
} from "@/shared/utils/format";
import { useMemo, useRef, useState } from "react";
import { TouchableOpacity } from "react-native";
import { useMapControlStore } from "../stores/use-map-control.store";

export default function RecordSummary() {
    const profile = useProfileStore((s) => s.profile);
    const preferences = useSettingsStore((s) => s.settings.preferences);
    const goal = preferences?.goal || 0;
    const unit = preferences?.unit;
    const setGoal = useSettingsStore((s) => s.setGoal);
    const duration = useRecordStore((s) => s.duration);
    const steps = useRecordStore((s) => s.steps);
    const coordinates = useRecordStore((s) => s.coordinates);
    const isMapExpanded = useMapControlStore((s) => s.isMapExpanded);
    const isMapReady = useMapControlStore((s) => s.isMapReady);
    const setIsMapExpanded = useMapControlStore((s) => s.setIsMapExpanded);
    const goalDrawerRef = useRef<DrawerHandle>(null);

    const [selectedActiveStat, setSelectedActiveStat] = useState("Duration");

    const { stats } = useMemo(() => {
        const distance = computeTotalDistance(coordinates);
        const formattedDistance = formatDistanceByUnit(
            distance,
            unit,
            false,
            2,
            2,
        );
        const calories = formatCalories(
            computeCalories(distance, profile?.weight ?? 70),
        );
        const durationSec = convertMsToS(duration);
        const pace = formatPaceByUnit(durationSec / distance, unit);
        const stats = [
            {
                label: "Duration",
                // value:
                //     selectedActiveStat === "Duration"
                //         ? formatDurationHHMMSS(duration)
                //         : formatDuration(duration),
                value: formatDurationHHMMSS(duration),
                icon: "timer" as const,
                unit: "",
                visible: true,
            },
            {
                label: "Distance",
                value: formattedDistance.value,
                unit: formattedDistance.unit,
                icon: "location" as const,
                visible: true,
            },
            {
                label: "Calories",
                value: calories,
                unit: "kcal",
                icon: "flame" as const,
                color: "text-orange-500",
                visible: true,
            },
            {
                label: "Pace",
                value: pace.value,
                unit: pace.unit,
                icon: "timer" as const,
                visible: true,
            },
            {
                label: "Steps",
                value: steps,
                icon: "footsteps" as const,
                visible: false,
            },
        ];
        return { stats };
    }, [coordinates, duration, profile?.weight, steps, selectedActiveStat]);

    const activeStat = stats.find((s) => s.label === selectedActiveStat);
    const updatedStats = stats.filter(
        (s) => s.visible && s.label !== selectedActiveStat,
    );
    return (
        <>
            <ColView
                className={cn(
                    "px-4 gap-4 justify-center",
                    !isMapExpanded && "flex-1",
                )}
            >
                <RowView className="justify-center items-start">
                    <ColView className="">
                        <RowView className="gap-1 items-center">
                            <Icon
                                name={activeStat?.icon}
                                size={12}
                                className="text-primary"
                            />
                            <Text className="text-xs text-muted-foreground">
                                {activeStat?.label}{" "}
                                {activeStat?.unit && (
                                    <Text className=" text-xs font-medium text-muted-foreground">
                                        ({activeStat.unit})
                                    </Text>
                                )}
                            </Text>
                        </RowView>
                        <Text className="text-6xl font-bold">
                            {activeStat?.value}
                        </Text>
                    </ColView>
                </RowView>
                <RowView className="justify-between gap-1">
                    {updatedStats.map((stat, i) => (
                        <TouchableOpacity
                            key={i}
                            onPress={() => setSelectedActiveStat(stat.label)}
                            className=""
                        >
                            <Card className={cn("bg-transparent p-0")}>
                                <ColView className="">
                                    <RowView className="gap-1 items-center">
                                        <Icon
                                            name={stat.icon}
                                            size={12}
                                            className="text-primary"
                                        />
                                        <Text className="text-xs text-muted-foreground">
                                            {stat.label}
                                            {stat.unit && (
                                                <Text className=" text-xs font-medium text-muted-foreground">
                                                    {" "}
                                                    ({stat.unit})
                                                </Text>
                                            )}
                                        </Text>
                                    </RowView>
                                    <RowView className="items-end">
                                        <Text className="text-3xl leading-4 font-medium ">
                                            {stat.value}
                                        </Text>
                                    </RowView>
                                </ColView>
                            </Card>
                        </TouchableOpacity>
                    ))}
                </RowView>
            </ColView>

            <GoalDrawer
                ref={goalDrawerRef}
                value={goal}
                onChange={async (v) => {
                    setGoal(v);
                    await settingsService.save({
                        preferences: { ...preferences, goal: v },
                    });
                }}
            />
        </>
    );
}
