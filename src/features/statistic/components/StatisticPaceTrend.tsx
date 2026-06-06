import { ColView, RowView } from "@/shared/components/CustomView";
import Card from "@/shared/components/ui/Card";
import Text from "@/shared/components/ui/Text";
import { useSettingsStore } from "@/shared/stores/use-settings-store";
import { formatPaceByUnit } from "@/shared/utils/format";
import {
    eachDayOfInterval,
    eachMonthOfInterval,
    format,
    isThisMonth,
    isToday,
} from "date-fns";
import { useMemo } from "react";
import { View } from "react-native";
import Svg, {
    Circle,
    Defs,
    Line,
    LinearGradient,
    Path,
    Polyline,
    Stop,
} from "react-native-svg";
import { useStatisticContext } from "../context/StatisticContext";

const CHART_H = 128;
const CHART_W = 280;
const PAD = 8;

export default function StatisticPaceTrendArea() {
    const { activeTab, activities, dateRange } = useStatisticContext();
    const preferences = useSettingsStore((s) => s.settings?.preferences);
    const unit = preferences?.unit || "kilometers";

    if (activeTab === "All Time") return null;

    const points = useMemo(() => {
        if (!dateRange.from || !dateRange.to) return [];

        if (activeTab === "Year") {
            const months = eachMonthOfInterval({
                start: dateRange.from,
                end: dateRange.to,
            });
            const byMonth = new Map<string, number[]>();
            activities.forEach((a) => {
                const key = format(new Date(a.createdAt), "yyyy-MM");
                if (!byMonth.has(key)) byMonth.set(key, []);
                byMonth.get(key)!.push(a.avgPace ?? 0);
            });
            return months.map((date) => {
                const paces = byMonth.get(format(date, "yyyy-MM")) ?? [];
                const avg = paces.length
                    ? paces.reduce((s, v) => s + v, 0) / paces.length
                    : 0;
                return {
                    date,
                    avg,
                    isToday: isThisMonth(date),
                    hasData: paces.length > 0,
                };
            });
        }

        const days = eachDayOfInterval({
            start: dateRange.from,
            end: dateRange.to,
        });
        const byDay = new Map<string, number[]>();
        activities.forEach((a) => {
            const key = new Date(a.createdAt).toDateString();
            if (!byDay.has(key)) byDay.set(key, []);
            byDay.get(key)!.push(a.avgPace ?? 0);
        });
        return days.map((date) => {
            const paces = byDay.get(date.toDateString()) ?? [];
            const avg = paces.length
                ? paces.reduce((s, v) => s + v, 0) / paces.length
                : 0;
            return {
                date,
                avg,
                isToday: isToday(date),
                hasData: paces.length > 0,
            };
        });
    }, [activeTab, activities, dateRange]);

    const activePoints = points.filter((p) => p.hasData);
    const maxPace = useMemo(
        () => Math.max(...points.map((d) => d.avg), 0),
        [points],
    );
    const minPace = Math.min(
        ...activePoints.filter((p) => p.avg > 0).map((p) => p.avg),
        maxPace,
    );

    const coords = useMemo(() => {
        if (!points.length) return [];
        return points.map((p, i) => {
            const x =
                PAD +
                (i / Math.max(points.length - 1, 1)) * (CHART_W - PAD * 2);
            const range = maxPace - minPace || 1;
            const y = p.hasData
                ? PAD + ((maxPace - p.avg) / range) * (CHART_H - PAD * 2)
                : null;
            return { ...p, x, y };
        });
    }, [points, maxPace, minPace]);

    const active = coords.filter((c) => c.y !== null);
    const linePoints = active.map((c) => `${c.x},${c.y}`).join(" ");

    const areaPath = useMemo(() => {
        if (!active.length) return "";
        const bottom = CHART_H - PAD;
        let d = `M ${active[0].x} ${bottom}`;
        active.forEach((c) => {
            d += ` L ${c.x} ${c.y}`;
        });
        d += ` L ${active[active.length - 1].x} ${bottom} Z`;
        return d;
    }, [active]);

    const ruler = useMemo(() => {
        const steps = 4;
        const stepValue = maxPace / steps;
        return Array.from(
            { length: steps + 1 },
            (_, i) => (steps - i) * stepValue,
        );
    }, [maxPace]);

    return (
        <ColView className="px-4 gap-1">
            <Card>
                <ColView>
                    <RowView className="justify-between items-center">
                        <Text className="text-lg font-medium">Pace Trends</Text>
                    </RowView>
                    <RowView className="gap-2">
                        <View
                            style={{ height: CHART_H }}
                            className="justify-between"
                        >
                            {ruler.map((r, i) => (
                                <Text key={i} className="text-xs leading-none">
                                    {formatPaceByUnit(r, unit).value}
                                </Text>
                            ))}
                        </View>
                        <View style={{ flex: 1, height: CHART_H }}>
                            <Svg
                                width="100%"
                                height={CHART_H}
                                viewBox={`0 0 ${CHART_W} ${CHART_H}`}
                            >
                                <Defs>
                                    <LinearGradient
                                        id="paceGrad"
                                        x1="0"
                                        y1="0"
                                        x2="0"
                                        y2="1"
                                    >
                                        <Stop
                                            offset="0%"
                                            stopColor="#f59e0b"
                                            stopOpacity="0.4"
                                        />
                                        <Stop
                                            offset="100%"
                                            stopColor="#f59e0b"
                                            stopOpacity="0.02"
                                        />
                                    </LinearGradient>
                                </Defs>
                                {ruler.map((_, i) => (
                                    <Line
                                        key={i}
                                        x1={0}
                                        y1={(i / (ruler.length - 1)) * CHART_H}
                                        x2={CHART_W}
                                        y2={(i / (ruler.length - 1)) * CHART_H}
                                        stroke="rgba(128,128,128,0.1)"
                                        strokeWidth={1}
                                    />
                                ))}
                                <Path d={areaPath} fill="url(#paceGrad)" />
                                <Polyline
                                    points={linePoints}
                                    fill="none"
                                    stroke="#f59e0b"
                                    strokeWidth="2"
                                    strokeLinejoin="round"
                                    strokeLinecap="round"
                                />
                                {active.map((c, i) => (
                                    <Circle
                                        key={i}
                                        cx={c.x}
                                        cy={c.y!}
                                        r={c.isToday ? 5 : 3}
                                        fill={c.isToday ? "#f59e0b" : "#fff"}
                                        stroke="#f59e0b"
                                        strokeWidth="2"
                                    />
                                ))}
                            </Svg>
                        </View>
                    </RowView>
                </ColView>
            </Card>
        </ColView>
    );
}
