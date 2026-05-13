import { useEffect } from "react";
import { locationService } from "../services/location/location.service";
import { useActivityTrackingStore } from "../stores/use-activity-tracking.store";

export const useActivityPreviewTracking = () => {
    const setPreviewCoordinate = useActivityTrackingStore(
        (s) => s.setPreviewCoordinate,
    );
    const status = useActivityTrackingStore((s) => s.status);
    const mode = useActivityTrackingStore((s) => s.mode);

    useEffect(() => {
        if (status === "active" || mode !== "preview") return;
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
