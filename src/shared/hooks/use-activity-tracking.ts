import { useEffect, useRef } from "react";
import { activityTrackingService } from "../services/activity-tracking.service";
import { locationService } from "../services/location.service";
import { useActivityTrackingStore } from "../stores/use-activity-tracking.store";

export const useActivityTracking = () => {
    const setDuration = useActivityTrackingStore((s) => s.setDuration);
    const setStatus = useActivityTrackingStore((s) => s.setStatus);
    const setCoordinates = useActivityTrackingStore((s) => s.setCoordinates);
    const addCoordinate = useActivityTrackingStore((s) => s.addCoordinate);

    // Keep refs up-to-date so callbacks always see the latest function references
    const addCoordinateRef = useRef(addCoordinate);
    const setDurationRef = useRef(setDuration);
    const setStatusRef = useRef(setStatus);

    useEffect(() => {
        addCoordinateRef.current = addCoordinate;
    }, [addCoordinate]);

    useEffect(() => {
        setDurationRef.current = setDuration;
    }, [setDuration]);

    useEffect(() => {
        setStatusRef.current = setStatus;
    }, [setStatus]);

    useEffect(() => {
        activityTrackingService.restore().then((stored) => {
            if (!stored) return;
            const metrics = activityTrackingService.getCurrentMetrics();
            if (!metrics) return;
            setDurationRef.current(metrics.duration);
            if (metrics.status) {
                setStatusRef.current(metrics.status);
            }
            if (metrics.coordinates) {
                setCoordinates(metrics.coordinates);
            }
        });
    }, []);

    useEffect(() => {
        const unsubscribeMetrics = activityTrackingService.onMetricsUpdate(
            (stats) => {
                setDurationRef.current(stats.duration);

                if (stats.status) {
                    setStatusRef.current(stats.status);
                }
            },
        );

        const unsubscribeLocation = locationService.onLocationUpdate((loc) => {
            addCoordinateRef.current(loc);
            console.log("use activity tracking:", loc);
        });

        return () => {
            unsubscribeMetrics();
            unsubscribeLocation();
        };
    }, []);
};
