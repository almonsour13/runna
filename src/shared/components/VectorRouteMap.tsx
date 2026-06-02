import { useMemo } from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import Svg, { Path } from "react-native-svg";
import { Coordinate } from "../types/type";

interface RouteMapProps {
    coordinates: Coordinate[];
    size?: number;
    color?: string;
    strokeWidth?: number;
}

const PAD = 40;

export default function VectorRouteMap({
    coordinates,
    size,
    color = "#02a963",
    strokeWidth = 8,
}: RouteMapProps) {
    const screenWidth = Dimensions.get("window").width - 32;
    const width = size ?? screenWidth;
    const height = width;

    const { pathD, startX, startY, endX, endY } = useMemo(() => {
        if (coordinates.length < 2) return null;

        const lats = coordinates.map((c) => c.latitude);
        const lngs = coordinates.map((c) => c.longitude);

        const minLat = Math.min(...lats);
        const maxLat = Math.max(...lats);
        const minLng = Math.min(...lngs);
        const maxLng = Math.max(...lngs);

        const latRange = maxLat - minLat || 0.001;
        const lngRange = maxLng - minLng || 0.001;

        const scale = Math.min(
            (width - PAD * 2) / lngRange,
            (height - PAD * 2) / latRange,
        );

        const offsetX = (width - lngRange * scale) / 2;
        const offsetY = (height - latRange * scale) / 2;

        const toX = (lng: number) => offsetX + (lng - minLng) * scale;
        const toY = (lat: number) => height - offsetY - (lat - minLat) * scale;

        const points = coordinates.map((c) => ({
            x: toX(c.longitude),
            y: toY(c.latitude),
        }));

        const pathD = points
            .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
            .join(" ");

        return {
            pathD,
            startX: points[0].x,
            startY: points[0].y,
            endX: points[points.length - 1].x,
            endY: points[points.length - 1].y,
        };
    }, [coordinates, width, height]) ?? {
        pathD: "",
        startX: 0,
        startY: 0,
        endX: 0,
        endY: 0,
    };
    // const glowColor = hexToRgba(color, 0.25);

    if (coordinates.length < 2) return null;

    return (
        <View style={[styles.wrapper, { width, height }]}>
            <Svg width={width} height={height}>
                <Path
                    d={pathD}
                    stroke={color}
                    strokeWidth={strokeWidth}
                    strokeLinejoin="round"
                    strokeLinecap="round"
                    fill="none"
                />
            </Svg>
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        overflow: "hidden",
    },
});
