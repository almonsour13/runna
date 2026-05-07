import Svg, { Circle, G } from "react-native-svg";

type StrokeLinecap = "butt" | "round" | "square";

interface RingChartProps {
    pct: number;
    radius?: number;
    strokeWidth?: number;
    strokeLinecap?: StrokeLinecap;
    trackColor?: string;
    trackWidth?: number;
    color?: string;
    gapDeg?: number;
    startDeg?: number; // 0 = 12 o'clock, 90 = 3 o'clock, 180 = 6 o'clock, etc.
}

export default function RingChart({
    pct,
    radius = 24,
    strokeWidth = 8,
    strokeLinecap = "round",
    trackColor = "#e5e7eb",
    trackWidth = 8,
    color = "#f59e0a",
    gapDeg = 0,
    startDeg = 0,
}: RingChartProps) {
    const clampedPct = Math.min(Math.max(pct, 0), 100); // ✅ clamp 0–100

    const CENTER = radius + strokeWidth;
    const CIRCUMFERENCE = 2 * Math.PI * radius;
    const SIZE = (radius + strokeWidth) * 2;
    const gapLength = (gapDeg / 360) * CIRCUMFERENCE;
    const trackArcLength = CIRCUMFERENCE - gapLength * 2;
    const progressArcLength = (clampedPct / 100) * trackArcLength; // ✅ use clamped

    const rotation = -90 + startDeg + gapDeg;

    return (
        <Svg width={SIZE} height={SIZE}>
            <G rotation={rotation} origin={`${CENTER}, ${CENTER}`}>
                <Circle
                    cx={CENTER}
                    cy={CENTER}
                    r={radius}
                    fill="transparent"
                    stroke={trackColor}
                    strokeWidth={trackWidth}
                    strokeDasharray={`${trackArcLength} ${CIRCUMFERENCE}`}
                    strokeLinecap={strokeLinecap}
                />
                <Circle
                    cx={CENTER}
                    cy={CENTER}
                    r={radius}
                    fill="transparent"
                    stroke={color ? color : "#22c55e"} // ✅ green when complete
                    strokeWidth={strokeWidth}
                    strokeDasharray={`${progressArcLength} ${CIRCUMFERENCE}`}
                    strokeLinecap={strokeLinecap}
                />
            </G>
        </Svg>
    );
}
