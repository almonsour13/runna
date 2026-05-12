import { useEffect } from "react";
import { activityTrackingService } from "../services/activity-tracking.service";
import { locationService } from "../services/location/location.service";
import { useActivityTrackingStore } from "../stores/use-activity-tracking.store";

export const useActivityTracking = () => {
    const setDuration = useActivityTrackingStore((s) => s.setDuration);
    const setStatus = useActivityTrackingStore((s) => s.setStatus);
    const setCoordinates = useActivityTrackingStore((s) => s.setCoordinates);
    const addCoordinate = useActivityTrackingStore((s) => s.addCoordinate);
    const setLabel = useActivityTrackingStore((s) => s.setLabel);
    const setMode = useActivityTrackingStore((s) => s.setMode);

    // Restore persisted activity on mount
    useEffect(() => {
        activityTrackingService.restore().then((stored) => {
            if (!stored) return;
            const metrics = activityTrackingService.getCurrentMetrics();
            if (!metrics) return;
            setDuration(metrics.duration);
            if (metrics.status) setStatus(metrics.status);
            if (metrics.coordinates) setCoordinates(metrics.coordinates);
        });
    }, []);

    // Subscribe to activity metrics updates
    useEffect(() => {
        const unsubscribe = activityTrackingService.onMetricsUpdate((stats) => {
            setDuration(stats.duration);
            if (stats.status) setStatus(stats.status);
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        const unsubscribe = locationService.onLocationUpdate(
            (loc, label, mode) => {
                if (mode) setMode(mode);
                if (label) setLabel(label);
                if (mode === "recording") addCoordinate(loc);
            },
        );

        return () => {
            unsubscribe();
        };
    }, []);
};
