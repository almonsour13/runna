import { ColView, RowView } from "@/shared/components/CustomView";
import GoalDrawer from "@/shared/components/drawer/GoalDrawer";
import Card from "@/shared/components/ui/Card";
import { DrawerHandle } from "@/shared/components/ui/Drawer";
import Icon from "@/shared/components/ui/Icon";
import Text from "@/shared/components/ui/Text";
import { useProfileStore } from "@/shared/stores/use-profile.store";
import { useRecordStore } from "@/shared/stores/use-record.store";
import { cn } from "@/shared/utils/cn";
import {
    computeCalories,
    computePace,
    computeTotalDistance,
} from "@/shared/utils/compute";
import { convertMsToS, convertMtoKm } from "@/shared/utils/convert";
import {
    formatCalories,
    formatDuration,
    formatDurationHHMMSS,
    formatPace,
} from "@/shared/utils/format";
import { useMemo, useRef, useState } from "react";
import { TouchableOpacity } from "react-native";

export default function RecordSummary() {
    const profile = useProfileStore((s) => s.profile);
    const goal = profile?.goal || 0;
    const setField = useProfileStore((s) => s.setField);
    const duration = useRecordStore((s) => s.duration);
    const steps = useRecordStore((s) => s.steps);
    const coordinates = useRecordStore((s) => s.coordinates);
    const goalDrawerRef = useRef<DrawerHandle>(null);

    const [selectedActiveStat, setSelectedActiveStat] = useState("Duration");

    const { stats } = useMemo(() => {
        const distance = computeTotalDistance(coordinates);
        const distanceKm = convertMtoKm(distance);
        const calories = formatCalories(
            computeCalories(distance, profile?.weight ?? 70),
        );
        const durationSec = convertMsToS(duration);
        const pace =
            distanceKm > 0.01
                ? formatPace(computePace(distance, convertMsToS(duration)))
                : "00:00";
        const stats = [
            {
                label: "Duration",
                value:
                    selectedActiveStat !== "Duration"
                        ? formatDuration(duration)
                        : formatDurationHHMMSS(duration),
                icon: "timer-outline" as const,
                unit: "min",
            },
            {
                label: "Distance",
                value: distanceKm.toFixed(2).padStart(2, "0"),
                unit: "km",
                icon: "location-outline" as const,
            },
            {
                label: "Calories",
                value: calories,
                unit: "kcal",
                icon: "flame-outline" as const,
                color: "text-orange-500",
            },
            {
                label: "Pace",
                value: pace,
                unit: "/km",
                icon: "timer-outline" as const,
            },
            {
                label: "Steps",
                value: steps,
                icon: "footsteps" as const,
            },
        ];
        return { stats };
    }, [coordinates, duration, profile?.weight, steps, selectedActiveStat]);

    const activeStat = stats.find((s) => s.label === selectedActiveStat);
    const updatedStats = stats.filter((s) => s.label !== selectedActiveStat);
    return (
        <>
            <ColView
                className={cn("flex-1 px-4 gap-4 justify-center items-center")}
            >
                <RowView className="gap-4 items-center">
                    <TouchableOpacity
                        onPress={() => goalDrawerRef.current?.open()}
                    >
                        <Card className="px-3 py-1.5">
                            <RowView className="gap-1.5">
                                <Icon
                                    name="flag"
                                    size={12}
                                    className="text-primary"
                                />
                                <Text className="text-xs ">
                                    {convertMtoKm(goal)} km
                                </Text>
                            </RowView>
                        </Card>
                    </TouchableOpacity>
                </RowView>
                <ColView className="items-center">
                    <Text className="text-6xl font-bold">
                        {activeStat?.value}
                    </Text>
                    <RowView className="items-center">
                        <Icon
                            name={activeStat?.icon}
                            size={12}
                            className="hidden text-primary"
                        />
                        <Text className="text-xs text-muted-foreground">
                            {activeStat?.label} {/* ✅ Fix 2: dynamic label */}
                        </Text>
                    </RowView>
                </ColView>
                <RowView className="justify-between">
                    {updatedStats.map((stat, i) => (
                        <TouchableOpacity
                            key={i}
                            onPress={() => setSelectedActiveStat(stat.label)}
                            className="flex-1 justify-center items-center"
                        >
                            <ColView className="">
                                <RowView className="items-end">
                                    <Text className="text-2xl leading-4 font-medium ">
                                        {stat.value}
                                    </Text>
                                </RowView>
                                <RowView className="items-center">
                                    <Icon
                                        name={stat.icon}
                                        size={12}
                                        className="hidden text-primary"
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
                            </ColView>
                        </TouchableOpacity>
                    ))}
                </RowView>
            </ColView>

            <GoalDrawer
                ref={goalDrawerRef}
                value={goal}
                onChange={(v) => {
                    setField("goal", v);
                }}
            />
        </>
    );
}
