import { useEffect } from "react";
import { locationService } from "../../../shared/services/location/location.service";
import { recordActivityService } from "../../../shared/services/record-activity.service";
import { stepCounterService } from "../../../shared/services/step-counter.service";
import { useRecordStore } from "../../../shared/stores/use-record.store";
import { logger } from "../../../shared/utils/logger";

// ✅ Fixed
export const useRecord = () => {
    const setDuration = useRecordStore((s) => s.setDuration);
    const setSteps = useRecordStore((s) => s.setSteps);
    const setStatus = useRecordStore((s) => s.setStatus);
    const setActivityType = useRecordStore((s) => s.setActivityType);
    const setCoordinates = useRecordStore((s) => s.setCoordinates);
    const addCoordinate = useRecordStore((s) => s.addCoordinate);
    const setPreviewCoordinate = useRecordStore((s) => s.setPreviewCoordinate);
    const setMode = useRecordStore((s) => s.setMode);
    const mode = useRecordStore((s) => s.mode);

    // Duration updates from the running interval
    useEffect(() => {
        const unsubscribe = recordActivityService.onDurationUpdate(setDuration);
        return () => unsubscribe();
    }, [setDuration]);

    // Restore persisted activity on mount
    useEffect(() => {
        let cancelled = false;

        recordActivityService
            .restore()
            .then((stored) => {
                if (!stored || cancelled) return;
                if (stored.computedDuration)
                    setDuration(stored.computedDuration);
                if (stored.activity) {
                    setStatus(stored.activity.status);
                    setActivityType(stored.activity.type);
                }
                // Load bulk coordinates before the live listener can add more
                if (stored.coordinates?.length)
                    setCoordinates(stored.coordinates);
            })
            .catch((error) => {
                logger.error("[useRecord] Failed to restore activity", error);
            });

        return () => {
            cancelled = true;
        };
    }, []);

    // Live location updates during recording
    useEffect(() => {
        const unsubscribe = locationService.onLocationUpdate((loc, mode) => {
            if (mode) setMode(mode);
            if (mode === "recording") {
                addCoordinate(loc);
            } else {
                setPreviewCoordinate(loc);
            }
        });
        return () => unsubscribe();
    }, [setMode, addCoordinate]);

    useEffect(() => {
        const unsubscribe = stepCounterService.onStep((steps) => {
            setSteps(steps);
        });
        return () => unsubscribe();
    }, [setSteps]);
};
