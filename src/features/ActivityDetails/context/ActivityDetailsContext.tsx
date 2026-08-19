import { activityService } from "@/shared/services/storage/activity.service";
import { ActivityWithCoordinates, Coordinate } from "@/shared/types/type";
import { computeKmSplits } from "@/shared/utils/compute";
import { useRoute } from "@react-navigation/native";
import { useQuery } from "@tanstack/react-query";
import React, {
    createContext,
    Dispatch,
    SetStateAction,
    useContext,
    useMemo,
    useState,
} from "react";
import { ActivityIndicator, View } from "react-native";
import ActivityDetailsEmptyState from "../Components/ActivityDetailsEmptyState";

export type KmSplits = {
    km: number;
    durationSec: number;
    paceMinkm: number;
    coord: Coordinate;
}[];

type ActivityDetailsContextType = {
    activity: ActivityWithCoordinates | null | undefined;
    coordinates: Coordinate[];
    kmSplits: KmSplits;
    isLoading: boolean;
    isRefreshing: boolean;
    refetch: () => Promise<void>;
    setIsRefreshing: Dispatch<SetStateAction<boolean>>;
};

const ActivityDetailsContext = createContext<ActivityDetailsContextType | null>(
    null,
);

export const useActivityDetailsContext = () => {
    const ctx = useContext(ActivityDetailsContext);
    if (!ctx) {
        throw new Error(
            "useActivityDetailsContext must be used within ActivityDetailsProvider",
        );
    }
    return ctx;
};

export default function ActivityDetailsProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const route = useRoute();
    const { activityId } = route.params as { activityId: string };
    const id = activityId;
    const [isRefreshing, setIsRefreshing] = useState(false);

    const {
        data: activity,
        isLoading,
        refetch: queryRefetch,
    } = useQuery({
        queryKey: ["activity", activityId],
        queryFn: async () => activityService.getById(activityId),
        enabled: !!activityId,
    });

    const coordinates = activity?.coordinates || [];

    const kmSplits = useMemo(
        () => (coordinates.length > 0 ? computeKmSplits(coordinates) : []),
        [coordinates],
    );

    const refetch = async () => {
        setIsRefreshing(true);
        try {
            await queryRefetch();
        } finally {
            setIsRefreshing(false);
        }
    };

    const value: ActivityDetailsContextType = {
        activity,
        coordinates,
        kmSplits,
        isLoading,
        isRefreshing,
        refetch,
        setIsRefreshing,
    };

    return (
        <ActivityDetailsContext.Provider value={value}>
            {isLoading ? (
                <View className="flex-1 items-center justify-center py-20">
                    <ActivityIndicator size="large" />
                </View>
            ) : activity && coordinates.length > 0 ? (
                children
            ) : (
                <ActivityDetailsEmptyState />
            )}
        </ActivityDetailsContext.Provider>
    );
}
