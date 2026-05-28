import { useEffect } from "react";
import { locationService } from "../services/location/location.service";
import { useRecordStore } from "../stores/use-record.store";

export const useActivityPreviewTracking = () => {
    const setPreviewCoordinate = useRecordStore((s) => s.setPreviewCoordinate);
    const status = useRecordStore((s) => s.status);
    const mode = useRecordStore((s) => s.mode);
    const setMode = useRecordStore((s) => s.setMode);

    useEffect(() => {
        if (status === "active" || mode !== "preview") return;
        locationService.startPreview();
        const unsubscribe = locationService.onLocationUpdate(
            (loc, label, mode) => {
                setPreviewCoordinate(loc);
                if (mode) setMode(mode);
            },
        );
        return () => {
            unsubscribe();
            locationService.stopPreview();
        };
    }, []);
};
