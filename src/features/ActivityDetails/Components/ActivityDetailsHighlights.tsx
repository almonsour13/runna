import { ColView, RowView } from "@/shared/components/CustomView";
import Card from "@/shared/components/ui/Card";
import Text from "@/shared/components/ui/Text";
import {
    computePace,
    computeSpeed,
    computeTotalDistance,
} from "@/shared/utils/compute";
import { convertMsToS, convertMtoKm } from "@/shared/utils/convert";
import { formatPace } from "@/shared/utils/format";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useActivityDetails } from "../context/ActivityDetailsContext";

export default function ActivityHighlights() {
    const { activity, splits } = useActivityDetails();
    const fastestSplit = splits.length
        ? splits.reduce((a, b) => (a.paceMinkm < b.paceMinkm ? a : b))
        : null;
    const slowestSplit = splits.length
        ? splits.reduce((a, b) => (a.paceMinkm > b.paceMinkm ? a : b))
        : null;

    const distance = computeTotalDistance(activity.coordinates);
    const distanceKm = Number(convertMtoKm(distance));
    const goalKm = Number(convertMtoKm(activity.goal));
    const pct = (distanceKm / goalKm) * 100 || 0;
    const clampedPct = Math.min(pct, 100);
    const remainingKm = Math.max(goalKm - distanceKm, 0);
    const durationSec = convertMsToS(activity.duration);
    const avgPaceVal = computePace(distance, durationSec);
    const avgSpeedVal = computeSpeed(distance, durationSec);

    if (!fastestSplit || !slowestSplit) return null;
    return (
        <ColView className="px-4 gap-2">
            <RowView className="items-center">
                <Text className="text-base text-foreground font-medium">
                    Highlights
                </Text>
            </RowView>
            <RowView className="gap-1">
                {[
                    {
                        icon: "flash-outline" as const,
                        label: "Best km",
                        value: `km ${fastestSplit.km}`,
                        sub: formatPace(fastestSplit.paceMinkm) + " /km",
                    },
                    {
                        icon: "trending-up-outline" as const,
                        label: "Avg pace",
                        value: formatPace(avgPaceVal),
                        sub: "min/km",
                    },
                    {
                        icon: "hourglass-outline" as const,
                        label: "Slowest km",
                        value: `km ${slowestSplit.km}`,
                        sub: formatPace(slowestSplit.paceMinkm) + " /km",
                    },
                ].map((h) => (
                    <Card key={h.label} className="flex-1">
                        <ColView className="gap-1">
                            <RowView className="items-center gap-1">
                                <Ionicons
                                    name={h.icon}
                                    size={10}
                                    className="text-primary"
                                />
                                <Text className="text-xs text-muted-foreground">
                                    {h.label}
                                </Text>
                            </RowView>
                            <Text className="text-xl font-medium">
                                {h.value}
                            </Text>
                            <Text className="text-[10px] text-muted-foreground">
                                {h.sub}
                            </Text>
                        </ColView>
                    </Card>
                ))}
            </RowView>
        </ColView>
    );
}
