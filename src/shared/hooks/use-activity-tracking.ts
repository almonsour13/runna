import { useEffect } from "react";
import { activityTrackingService } from "../services/activity-tracking.service";
import { useActivityTrackingStore } from "../stores/use-activity-tracking.store";

export const useActivityTracking = () => {
    const setDuration = useActivityTrackingStore((s) => s.setDuration);
    const setStatus = useActivityTrackingStore((s) => s.setStatus);

    useEffect(() => {
        return activityTrackingService.onStatsUpdate((stats) => {
            setDuration(stats.duration);
        });
    }, []);
};
