import { ColView, RowView } from "@/shared/components/CustomView";
import Text from "@/shared/components/ui/Text";
import { computePace, computeTotalDistance } from "@/shared/utils/compute";
import { convertMsToS } from "@/shared/utils/convert";
import { formatDuration } from "@/shared/utils/format";
import Ionicons from "@expo/vector-icons/Ionicons";
import { View } from "react-native";
import { useActivityDetails } from "../context/ActivityDetailsContext";

function formatPaceMin(paceMinkm: number): string {
    const min = Math.floor(paceMinkm);
    const sec = Math.round((paceMinkm - min) * 60);
    return `${min}:${String(sec).padStart(2, "0")}`;
}
export default function ActivitySplits() {
    const { activity, splits } = useActivityDetails();

    const fastestSplit = splits.length
        ? splits.reduce((a, b) => (a.paceMinkm < b.paceMinkm ? a : b))
        : null;
    const slowestSplit = splits.length
        ? splits.reduce((a, b) => (a.paceMinkm > b.paceMinkm ? a : b))
        : null;

    const distance = computeTotalDistance(activity.coordinates);
    const durationSec = convertMsToS(activity.duration);
    const avgPaceVal = computePace(distance, durationSec);
    return (
        <ColView className="px-4 gap-2">
            <RowView className="gap-1 items-center">
                <Ionicons
                    name="flag-outline"
                    size={12}
                    className="text-primary"
                />
                <Text className="text-sm text-muted-foreground">Km Splits</Text>
            </RowView>

            {/* Column headers */}
            <RowView className="justify-between px-1">
                <Text className="text-xs text-muted-foreground w-10">km</Text>
                <Text className="text-xs text-muted-foreground flex-1 text-right">
                    Time
                </Text>
                <Text className="text-xs text-muted-foreground flex-1 text-right">
                    Pace
                </Text>
                <Text className="text-xs text-muted-foreground w-16 text-right">
                    vs avg
                </Text>
            </RowView>

            <View className="border-b border-border/20" />

            {splits.map((split, i) => {
                const isFastest = fastestSplit?.km === split.km;
                const isSlowest = slowestSplit?.km === split.km;
                const diff = split.paceMinkm - avgPaceVal;
                const diffLabel =
                    diff > 0
                        ? `+${formatPaceMin(Math.abs(diff))}`
                        : `-${formatPaceMin(Math.abs(diff))}`;
                const isAhead = diff < 0;

                return (
                    <ColView key={i} className="gap-1">
                        <RowView className="justify-between items-center px-1 py-0.5">
                            <RowView className="gap-1.5 items-center w-10">
                                <Text className="text-sm font-medium">
                                    {split.km}
                                </Text>
                                {isFastest && (
                                    <Text className="text-[10px]">⚡</Text>
                                )}
                                {isSlowest && (
                                    <Text className="text-[10px]">🐢</Text>
                                )}
                            </RowView>
                            <Text className="text-sm flex-1 text-right text-muted-foreground">
                                {formatDuration(split.durationSec)}
                            </Text>
                            <Text className="text-sm font-medium flex-1 text-right">
                                {formatPaceMin(split.paceMinkm)}
                            </Text>
                            <Text
                                className={`text-xs w-16 text-right ${
                                    isAhead
                                        ? "text-primary"
                                        : "text-muted-foreground"
                                }`}
                            >
                                {diffLabel}
                            </Text>
                        </RowView>
                        <View className="border-b border-border/20" />
                    </ColView>
                );
            })}
        </ColView>
    );
}
