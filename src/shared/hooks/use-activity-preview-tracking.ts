import { useEffect } from "react";
import { locationService } from "../services/location/location.service";
import { useActivityTrackingStore } from "../stores/use-activity-tracking.store";

export const useActivityPreviewTracking = () => {
    const setPreviewCoordinate = useActivityTrackingStore(
        (s) => s.setPreviewCoordinate,
    );

    useEffect(() => {
        locationService.startPreview();

        const unsubscribe = locationService.onLocationUpdate(
            (loc, label, mode) => {
                setPreviewCoordinate(loc);
            },
        );

        return () => {
            unsubscribe();
            locationService.stopPreview();
        };
    }, []);
};
