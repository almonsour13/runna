import { ColView, RowView } from "@/shared/components/CustomView";
import Icon from "@/shared/components/ui/Icon";
import Text from "@/shared/components/ui/Text";
import VectorRouteMap from "@/shared/components/VectorRouteMap";
import { NavigationProp } from "@/shared/types/type";
import { formatStats } from "@/shared/utils/format";
import { simplifyCoordinates } from "@/shared/utils/simplify-coordinates";
import { useNavigation } from "@react-navigation/native";
import { useMemo } from "react";
import { TouchableOpacity, View } from "react-native";
import { useActivityDetailsContext } from "../context/ActivityDetailsContext";

export default function ActivityDetailsShareScreen() {
    // const viewShotRef = useRef<ViewShot>(null);
    const navigation = useNavigation<NavigationProp>();
    const { activity, coordinates, isLoading, isRefreshing, refetch } =
        useActivityDetailsContext();
    if (!activity) {
        return null;
    }
    const { distance, duration, calories, pace, speed, steps, goal } =
        useMemo(() => {
            return {
                distance: activity.distance ?? 0,
                duration: activity.duration ?? 0,
                calories: activity.calories ?? 0,
                pace: activity.avgPace ?? 0,
                speed: activity.avgSpeed ?? 0,
                steps: activity.steps ?? 0,
                goal: activity.goal ?? 0,
            };
        }, [activity]);

    const stats = formatStats({
        distance,
        duration,
        calories,
        pace,
        speed,
        steps,
    });

    const simplifiedCoordinates = simplifyCoordinates(
        coordinates,
        0.0001,
        false,
    );

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
            {/* <ViewShot
                ref={viewShotRef}
                options={{
                    format: "png",
                    quality: 1,
                    result: "tmpfile",
                }}
                style={{ flex: 1 }}
            > */}
            <ColView className="flex-1 relative items-center justify-center pb-4">
                <ColView
                    className="w-full justify-center"
                    style={{
                        // transform: "scale(1)",
                        transformOrigin: "center",
                    }}
                >
                    {coordinates && coordinates.length > 0 && (
                        <VectorRouteMap
                            coordinates={simplifiedCoordinates}
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
                                        {/* <Icon
                                            name={stat.icon}
                                            size={10}
                                            className="text-foreground"
                                        /> */}
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
                                                {stat.key !== "duration" && " "}
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
            {/* </ViewShot> */}
            <ColView className="p-4">
                <RowView>
                    <TouchableOpacity className="flex-1 h-16 justify-center  bg-card rounded-full px-6 items-center">
                        <Text className="text-foreground text-lg font-medium">
                            Share
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity className="flex-1 h-16 justify-center bg-primary rounded-full px-6 items-center">
                        <Text className="text-white text-lg font-medium">
                            Save
                        </Text>
                    </TouchableOpacity>
                </RowView>
            </ColView>
        </ColView>
    );
}
