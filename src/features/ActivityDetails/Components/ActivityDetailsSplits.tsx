import { ColView, RowView } from "@/shared/components/CustomView";
import Text from "@/shared/components/ui/Text";
import { Activity } from "@/shared/db/repositories/activity.repository";
import { convertMsToS } from "@/shared/utils/convert";
import { formatDuration } from "@/shared/utils/format";
import { View } from "react-native";
import { KmSplits } from "../ActivityDetailsScreen";

function formatPaceMin(paceMinkm: number): string {
    const min = Math.floor(paceMinkm);
    const sec = Math.round((paceMinkm - min) * 60);
    return `${min}:${String(sec).padStart(2, "0")}`;
}
export default function ActivityDetailsSplits({
    activity,
    kmSplits,
}: {
    activity: Activity;
    kmSplits: KmSplits;
}) {
    if (!activity) return null;
    const fastestSplit = kmSplits.length
        ? kmSplits.reduce((a, b) => (a.paceMinkm < b.paceMinkm ? a : b))
        : null;
    const slowestSplit = kmSplits.length
        ? kmSplits.reduce((a, b) => (a.paceMinkm > b.paceMinkm ? a : b))
        : null;

    const distance = activity?.distance ?? 0;
    const durationSec = convertMsToS(activity.duration);
    return (
        <ColView className="px-4 gap-2">
            <RowView className="items-center">
                <Text className="text-base text-foreground font-medium">
                    Km Splits
                </Text>
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
            </RowView>

            <View className="border-b border-border/40" />

            {kmSplits.map((split, i) => {
                const isFastest = fastestSplit?.km === split.km;
                const isSlowest = slowestSplit?.km === split.km;

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
                        </RowView>
                        <View className="border-b border-border/40" />
                    </ColView>
                );
            })}
        </ColView>
    );
}
