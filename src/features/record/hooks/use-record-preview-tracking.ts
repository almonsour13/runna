import { useEffect, useRef } from "react";
import { locationService } from "../../../shared/services/location/location.service";
import { useRecordStore } from "../../../shared/stores/use-record.store";

export const useRecordPreviewTracking = () => {
    const status = useRecordStore((s) => s.status);
    const startedRef = useRef(false);

    useEffect(() => {
        if (status === "active") return;
        let cancelled = false;
        const start = async () => {
            await locationService.startPreview();
            if (cancelled) {
                locationService.stopPreview();
            } else {
                startedRef.current = true;
            }
        };
        start();

        return () => {
            cancelled = true;
            if (startedRef.current) {
                locationService.stopPreview();
                startedRef.current = false;
            }
        };
    }, [status]);
};
