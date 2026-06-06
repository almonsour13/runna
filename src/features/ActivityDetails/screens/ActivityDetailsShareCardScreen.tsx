import { ColView, RowView } from "@/shared/components/CustomView";
import Icon from "@/shared/components/ui/Icon";
import Text from "@/shared/components/ui/Text";
import VectorRouteMap from "@/shared/components/VectorRouteMap";
import { useFormatMetrics } from "@/shared/hooks/use-format-metrics";
import { NavigationProp } from "@/shared/types/type";
import { cn } from "@/shared/utils/cn";
import { useNavigation } from "@react-navigation/native";
import * as MediaLibrary from "expo-media-library";
import * as Sharing from "expo-sharing";
import { useMemo, useRef, useState } from "react";
import { Alert, TouchableOpacity, View } from "react-native";
import ViewShot from "react-native-view-shot";
import { useActivityDetailsContext } from "../context/ActivityDetailsContext";

export default function ActivityDetailsShareCardScreen() {
    const viewShotRef = useRef<ViewShot>(null);
    const navigation = useNavigation<NavigationProp>();
    const { activity, coordinates } = useActivityDetailsContext();
    const [mediaPermission, requestMediaPermission] =
        MediaLibrary.usePermissions();
    const [isSaving, setIsSaving] = useState(false);

    if (!activity) return null;

    const { distance, duration, calories, pace, speed, steps } = useMemo(
        () => ({
            distance: activity.distance ?? 0,
            duration: activity.duration ?? 0,
            calories: activity.calories ?? 0,
            pace: activity.avgPace ?? 0,
            speed: activity.avgSpeed ?? 0,
            steps: activity.steps ?? 0,
        }),
        [activity],
    );

    const stats = useFormatMetrics({
        distance,
        duration,
        calories,
        pace,
        speed,
        steps,
    });

    async function handleShare() {
        try {
            const uri = await viewShotRef.current?.capture?.();
            if (!uri) return;

            if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(uri, { mimeType: "image/png" });
            } else {
                Alert.alert("Sharing is not available on this device");
            }
        } catch {
            Alert.alert("Error", "Failed to share activity");
        }
    }

    async function handleSave() {
        if (isSaving) return;
        setIsSaving(true);
        try {
            let permission = mediaPermission;
            if (!permission?.granted) {
                permission = await requestMediaPermission();
            }
            if (!permission?.granted) {
                Alert.alert(
                    "Permission required",
                    "Allow access to save images to your library.",
                );
                return;
            }

            const uri = await viewShotRef.current?.capture?.();
            if (!uri) return;

            await MediaLibrary.saveToLibraryAsync(uri);
            Alert.alert("Saved", "Activity image saved to your photo library.");
            navigation.goBack();
        } catch {
            Alert.alert("Error", "Failed to save activity");
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <ColView className="flex-1 gap-0">
            <RowView className="p-4 items-center justify-between">
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Icon
                        name="arrow-back"
                        size={24}
                        className="text-foreground"
                    />
                </TouchableOpacity>
                <Text className="text-2xl font-medium">Share Activity</Text>
                <View className="w-6" />
            </RowView>
            <View className="px-4 py-2">
                <View className="self-start px-3 py-1 border border-border rounded">
                    <Text className="text-sm">Transparent</Text>
                </View>
            </View>
            <ViewShot
                ref={viewShotRef}
                options={{ format: "png", quality: 1, result: "tmpfile" }}
                style={{ flex: 1 }}
            >
                <ColView className="flex-1 relative items-center justify-center pb-4">
                    <ColView className="w-full justify-center">
                        {coordinates && coordinates.length > 0 && (
                            <VectorRouteMap
                                coordinates={coordinates}
                                size={340}
                                strokeWidth={6}
                            />
                        )}
                        <RowView className="flex-wrap gap-4">
                            {stats.map((stat) => (
                                <View
                                    key={stat.label}
                                    className="flex-1 min-w-[28%]"
                                >
                                    <ColView className="items-center gap-1 justify-center">
                                        <RowView className="items-center gap-1">
                                            <Icon
                                                name={stat.icon}
                                                size={10}
                                                className="text-foreground"
                                            />
                                            <Text className="text-sm">
                                                {stat.label}
                                            </Text>
                                        </RowView>
                                        <RowView>
                                            {stat.value.map((v, i) => (
                                                <Text
                                                    key={i}
                                                    className="text-2xl font-medium"
                                                >
                                                    {v.value}
                                                    {stat.key !== "duration" &&
                                                        " "}
                                                    {v.unit && (
                                                        <Text className="text-base font-medium">
                                                            {v.unit}
                                                        </Text>
                                                    )}
                                                </Text>
                                            ))}
                                        </RowView>
                                    </ColView>
                                </View>
                            ))}
                        </RowView>
                    </ColView>
                </ColView>
            </ViewShot>
            <ColView className="p-4">
                <RowView>
                    <TouchableOpacity
                        onPress={handleShare}
                        className="flex-1 h-16 justify-center bg-card rounded-full px-6 items-center"
                    >
                        <Text className="text-foreground text-lg font-medium">
                            Share
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={handleSave}
                        className={cn(
                            "flex-1 h-16 justify-center bg-primary rounded-full px-6 items-center",
                            {
                                "opacity-50": isSaving,
                            },
                        )}
                    >
                        <Text className="text-white text-lg font-medium">
                            {isSaving ? "Saving..." : "Save"}
                        </Text>
                    </TouchableOpacity>
                </RowView>
            </ColView>
        </ColView>
    );
}
