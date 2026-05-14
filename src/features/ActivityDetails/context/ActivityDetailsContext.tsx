import { activityService } from "@/shared/services/storage/activity.service";
import { Activity, Coordinate } from "@/shared/types/type";
import {
    computeKmSplits,
    computePace,
    computeSpeed,
    computeTotalDistance,
} from "@/shared/utils/compute";
import { convertMsToS, convertMtoKm } from "@/shared/utils/convert";
import { useRoute } from "@react-navigation/native";
import { createContext, useContext, useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import ActivityDetailsEmptyState from "../Components/ActivityDetailsEmptyState";

type ActivityDetailsContextType = {
    isLoading: boolean;
    activity: Activity;
    splits: {
        km: number;
        durationSec: number;
        paceMinkm: number;
        coord: Coordinate;
    }[];
};

export const ActivityDetailsContext =
    createContext<ActivityDetailsContextType | null>(null);

export default function ActivityDetailsProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const route = useRoute();

    const { activityId } = route.params as { activityId: string };
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const [activity, setActivity] = useState<Activity | null>(null);

    const fetchActivity = async () => {
        try {
            setError(null);
            setIsLoading(true);
            const data = await activityService.getById(activityId);
            setActivity(data);
        } catch (error) {
            setError(error as Error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchActivity();
    }, [activityId]);

    if (isLoading)
        return (
            <View className="flex-1 justify-center items-center">
                <ActivityIndicator />
            </View>
        );
    if (!activity) return <ActivityDetailsEmptyState />;

    const splits = computeKmSplits(activity.coordinates);
    const distance = computeTotalDistance(activity.coordinates);
    const distanceKm = Number(convertMtoKm(distance));
    const goalKm = Number(convertMtoKm(activity.goal));
    const pct = (distanceKm / goalKm) * 100 || 0;

    const remainingKm = Math.max(goalKm - distanceKm, 0);
    const durationSec = convertMsToS(activity.duration);
    const avgPaceVal = computePace(distance, durationSec);
    const avgSpeedVal = computeSpeed(distance, durationSec);

    return (
        <ActivityDetailsContext.Provider
            value={{
                isLoading: false,
                activity,
                splits,
            }}
        >
            {children}
        </ActivityDetailsContext.Provider>
    );
}

export function useActivityDetails() {
    const ctx = useContext(ActivityDetailsContext);
    if (!ctx) {
        throw new Error(
            "useActivityDetails must be used inside ActivityDetailsProvider",
        );
    }
    return ctx;
}
