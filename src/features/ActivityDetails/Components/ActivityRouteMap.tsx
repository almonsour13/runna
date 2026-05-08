import { ColView } from "@/shared/components/CustomView";
import { Coordinate } from "@/shared/types/type";
import { computeDistance } from "@/shared/utils/compute";
import { useMemo } from "react";
import { Dimensions, View } from "react-native";
import Svg, {
    Circle,
    Defs,
    LinearGradient,
    Path,
    Stop,
    Text as SvgText,
} from "react-native-svg";
import { useActivityDetails } from "../context/ActivityDetailsContext";

const SCREEN_WIDTH = Dimensions.get("window").width;
const HEADER_SCROLL_THRESHOLD = 200;
function EnhancedRouteMap({
    coordinates,
    type,
    accentColor,
    kmMarkers,
    goalReachedCoord,
}: {
    coordinates: Coordinate[];
    type: "walk" | "run";
    accentColor: string;
    kmMarkers: { km: number; coord: Coordinate }[];
    goalReachedCoord: Coordinate | null;
}) {
    const PAD = 48;
    const size = SCREEN_WIDTH - 32;
    const H = size;

    const { pathD, toX, toY } = useMemo(() => {
        const lats = coordinates.map((c) => c.latitude);
        const lngs = coordinates.map((c) => c.longitude);
        const minLat = Math.min(...lats);
        const maxLat = Math.max(...lats);
        const minLng = Math.min(...lngs);
        const maxLng = Math.max(...lngs);
        const latRange = maxLat - minLat || 0.001;
        const lngRange = maxLng - minLng || 0.001;
        const scale = Math.min(
            (size - PAD * 2) / lngRange,
            (H - PAD * 2) / latRange,
        );
        const offsetX = (size - lngRange * scale) / 2;
        const offsetY = (H - latRange * scale) / 2;
        const toX = (lng: number) => offsetX + (lng - minLng) * scale;
        const toY = (lat: number) => H - offsetY - (lat - minLat) * scale;
        const points = coordinates.map((c) => ({
            x: toX(c.longitude),
            y: toY(c.latitude),
        }));
        const pathD = points
            .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
            .join(" ");
        return { pathD, toX, toY };
    }, [coordinates, size, H]);

    const gradientId = `grad_${type}`;
    const glowColor =
        type === "run" ? "rgba(55,138,221,0.18)" : "rgba(29,158,117,0.18)";
    const colors =
        type === "run"
            ? { from: "#185FA5", to: "#73B8F4" }
            : { from: "#0F6E56", to: "#5DCAA5" };

    const startCoord = coordinates[0];
    const endCoord = coordinates[coordinates.length - 1];

    return (
        <View
            style={{
                width: size,
                height: H,
                borderRadius: 16,
                overflow: "hidden",
            }}
        >
            <Svg width={size} height={H}>
                <Defs>
                    <LinearGradient
                        id={gradientId}
                        x1={toX(startCoord.longitude)}
                        y1={toY(startCoord.latitude)}
                        x2={toX(endCoord.longitude)}
                        y2={toY(endCoord.latitude)}
                        gradientUnits="userSpaceOnUse"
                    >
                        <Stop
                            offset="0"
                            stopColor={colors.from}
                            stopOpacity={0.7}
                        />
                        <Stop
                            offset="1"
                            stopColor={colors.to}
                            stopOpacity={1}
                        />
                    </LinearGradient>
                </Defs>

                {/* Glow */}
                <Path
                    d={pathD}
                    stroke={glowColor}
                    strokeWidth={10}
                    strokeLinejoin="round"
                    strokeLinecap="round"
                    fill="none"
                />

                {/* Route */}
                <Path
                    d={pathD}
                    stroke={`url(#${gradientId})`}
                    strokeWidth={3}
                    strokeLinejoin="round"
                    strokeLinecap="round"
                    fill="none"
                />

                {/* Goal reached marker */}
                {goalReachedCoord &&
                    (() => {
                        const gx = toX(goalReachedCoord.longitude);
                        const gy = toY(goalReachedCoord.latitude);
                        return (
                            <>
                                <Circle
                                    cx={gx}
                                    cy={gy}
                                    r={10}
                                    fill="#F59E0B"
                                    opacity={0.2}
                                />
                                <Circle cx={gx} cy={gy} r={6} fill="#F59E0B" />
                                <SvgText
                                    x={gx + 10}
                                    y={gy - 8}
                                    fontSize={9}
                                    fontWeight="600"
                                    fill="#F59E0B"
                                >
                                    🎯 goal
                                </SvgText>
                            </>
                        );
                    })()}

                {/* Km split markers */}
                {kmMarkers.map(({ km, coord }) => {
                    const mx = toX(coord.longitude);
                    const my = toY(coord.latitude);
                    return (
                        <View key={km}>
                            <Circle
                                cx={mx}
                                cy={my}
                                r={9}
                                fill="rgba(0,0,0,0.55)"
                                stroke={accentColor}
                                strokeWidth={1.5}
                            />
                            <SvgText
                                x={mx}
                                y={my + 3.5}
                                fontSize={7}
                                fontWeight="700"
                                fill="white"
                                textAnchor="middle"
                            >
                                {km}
                            </SvgText>
                        </View>
                    );
                })}

                {/* Start dot */}
                <Circle
                    cx={toX(startCoord.longitude)}
                    cy={toY(startCoord.latitude)}
                    r={8}
                    fill="white"
                />
                <Circle
                    cx={toX(startCoord.longitude)}
                    cy={toY(startCoord.latitude)}
                    r={8}
                    stroke="#1D9E75"
                    strokeWidth={2.5}
                    fill="none"
                />
                <Circle
                    cx={toX(startCoord.longitude)}
                    cy={toY(startCoord.latitude)}
                    r={3.5}
                    fill="#1D9E75"
                />

                {/* End dot */}
                <Circle
                    cx={toX(endCoord.longitude)}
                    cy={toY(endCoord.latitude)}
                    r={8}
                    fill="white"
                />
                <Circle
                    cx={toX(endCoord.longitude)}
                    cy={toY(endCoord.latitude)}
                    r={8}
                    stroke="#E24B4A"
                    strokeWidth={2.5}
                    fill="none"
                />
                <Circle
                    cx={toX(endCoord.longitude)}
                    cy={toY(endCoord.latitude)}
                    r={3.5}
                    fill="#E24B4A"
                />
            </Svg>
        </View>
    );
}
export default function ActivityRouteMap() {
    const { activity, splits } = useActivityDetails();

    // Goal reached coordinate — find first coord where cumulative distance >= goal
    const goalReachedCoord = useMemo(() => {
        let cum = 0;
        for (let i = 1; i < activity.coordinates.length; i++) {
            cum += computeDistance(
                activity.coordinates[i - 1],
                activity.coordinates[i],
            );
            if (cum >= activity.goal) return activity.coordinates[i];
        }
        return null;
    }, [activity.coordinates, activity.goal]);

    const kmMarkers = splits.map((s) => ({ km: s.km, coord: s.coord }));
    const accentColor = "#0F6E56";
    return (
        <ColView className="px-4">
            <EnhancedRouteMap
                coordinates={activity.coordinates}
                type={activity.type}
                accentColor={accentColor}
                kmMarkers={kmMarkers}
                goalReachedCoord={goalReachedCoord}
            />
        </ColView>
    );
}
