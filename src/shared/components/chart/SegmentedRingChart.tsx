import Svg, { Circle, G } from "react-native-svg";

export interface RingSegment {
    label: string;
    value: number;
    color: string;
}

type StrokeLinecap = "butt" | "round" | "square";

interface SegmentedRingChartProps {
    segments: RingSegment[];
    radius?: number;
    strokeWidth?: number;
    strokeLinecap?: StrokeLinecap;
    gapDeg?: number;
    startDeg?: number;
    trackColor?: string;
    trackWidth?: number;
    showTrack?: boolean;
}

export default function SegmentedRingChart({
    segments,
    radius = 70,
    strokeWidth = 12,
    strokeLinecap = "butt",
    gapDeg = 4,
    startDeg = -90,
    trackColor = "#e5e7eb",
    trackWidth = 12,
    showTrack = false,
}: SegmentedRingChartProps) {
    const activeSegments = segments.filter((s) => s.value > 0);
    const total = activeSegments.reduce((sum, s) => sum + s.value, 0);

    if (total === 0 || activeSegments.length === 0) return null;

    const CENTER = radius + strokeWidth + 2;
    const SIZE = CENTER * 2;
    const CIRCUMFERENCE = 2 * Math.PI * radius;

    const totalGapDeg = gapDeg * activeSegments.length;
    const usableDeg = 360 - totalGapDeg;

    let currentAngle = startDeg;

    return (
        <Svg width={SIZE} height={SIZE}>
            {showTrack && (
                <Circle
                    cx={CENTER}
                    cy={CENTER}
                    r={radius}
                    fill="transparent"
                    stroke={trackColor}
                    strokeWidth={trackWidth}
                    strokeDasharray={`${CIRCUMFERENCE} ${CIRCUMFERENCE}`}
                />
            )}
            {activeSegments.map((seg, i) => {
                const segDeg = (seg.value / total) * usableDeg;
                const arcLen = (segDeg / 360) * CIRCUMFERENCE;
                const rotation = currentAngle;
                currentAngle += segDeg + gapDeg;

                return (
                    <G
                        key={i}
                        rotation={rotation}
                        origin={`${CENTER}, ${CENTER}`}
                    >
                        <Circle
                            cx={CENTER}
                            cy={CENTER}
                            r={radius}
                            fill="transparent"
                            stroke={seg.color}
                            strokeWidth={strokeWidth}
                            strokeDasharray={`${arcLen.toFixed(3)} ${CIRCUMFERENCE.toFixed(3)}`}
                            strokeLinecap={strokeLinecap}
                        />
                    </G>
                );
            })}
        </Svg>
    );
}
