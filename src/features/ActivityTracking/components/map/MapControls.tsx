import { RowView } from "@/shared/components/CustomView";
import { useActivityTrackingStore } from "@/shared/stores/use-activity-tracking.store";
import { cn } from "@/shared/utils/cn";
import { Ionicons } from "@expo/vector-icons";
import { Camera } from "@maplibre/maplibre-react-native";
import { useMemo } from "react";
import { TouchableOpacity } from "react-native";
import { useMapControlStore } from "../../stores/use-map-control.store";

type Props = {
    cameraRef: React.RefObject<React.ElementRef<typeof Camera> | null>;
};

export default function MapControls({ cameraRef }: Props) {
    const isFollowingUser = useMapControlStore((s) => s.isFollowingUser);
    const setIsFollowingUser = useMapControlStore((s) => s.setIsFollowingUser);
    const is3D = useMapControlStore((s) => s.is3D);
    const setIs3D = useMapControlStore((s) => s.setIs3D);
    const setPitch = useMapControlStore((s) => s.setPitch);

    const coordinates = useActivityTrackingStore((s) => s.coordinates);
    const previewCoordinate = useActivityTrackingStore(
        (s) => s.previewCoordinate,
    );

    const currentLocation = useMemo(
        () => coordinates[coordinates.length - 1] ?? previewCoordinate,
        [coordinates, previewCoordinate],
    );

    const recenter = () => {
        if (!currentLocation || !cameraRef.current) return;
        setIsFollowingUser(true);
        cameraRef.current.easeTo({
            center: [currentLocation.longitude, currentLocation.latitude],
            zoom: 17,
            duration: 500,
        });
    };

    const fitRoute = () => {
        if (coordinates.length < 2 || !cameraRef.current) return;
        setIsFollowingUser(false);

        let west = coordinates[0].longitude;
        let east = coordinates[0].longitude;
        let south = coordinates[0].latitude;
        let north = coordinates[0].latitude;

        for (const coord of coordinates) {
            west = Math.min(west, coord.longitude);
            east = Math.max(east, coord.longitude);
            south = Math.min(south, coord.latitude);
            north = Math.max(north, coord.latitude);
        }

        const lngPadding = Math.max((east - west) * 0.1, 0.001);
        const latPadding = Math.max((north - south) * 0.1, 0.001);

        cameraRef.current.fitBounds(
            [
                west - lngPadding,
                south - latPadding,
                east + lngPadding,
                north + latPadding,
            ],
            {
                padding: { top: 40, right: 40, bottom: 40, left: 40 },
                duration: 1000,
            },
        );
    };

    const toggle3D = () => {
        if (!cameraRef.current) return;
        const next = !is3D;
        setIs3D(next);
        const pitchValue = next ? 60 : 0;
        setPitch(pitchValue);
    };

    return (
        <RowView className="absolute right-4 top-4">
            <TouchableOpacity
                className={cn(
                    "h-8 w-8 aspect-square rounded-full bg-card justify-center items-center",
                    isFollowingUser && "bg-primary",
                )}
                onPress={recenter}
            >
                <Ionicons
                    name="locate-outline"
                    size={16}
                    className="text-foreground"
                />
            </TouchableOpacity>

            {coordinates.length >= 2 && (
                <TouchableOpacity
                    className="h-8 aspect-square rounded-full bg-card justify-center items-center"
                    onPress={fitRoute}
                >
                    <Ionicons
                        name="scan-outline"
                        size={16}
                        className="text-foreground"
                    />
                </TouchableOpacity>
            )}

            <TouchableOpacity
                className={cn(
                    "hidden h-8 w-8 aspect-square rounded-full bg-card justify-center items-center",
                    is3D && "bg-primary",
                )}
                onPress={toggle3D}
            >
                <Ionicons
                    name="cube-outline"
                    size={16}
                    className="text-foreground"
                />
            </TouchableOpacity>
        </RowView>
    );
}
