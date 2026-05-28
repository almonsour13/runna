import { useEffect } from "react";
import { locationService } from "../services/location/location.service";
import { recordActivityService } from "../services/record-activity.service";
import { useRecordStore } from "../stores/use-record.store";

export const useRecord = () => {
    const setDuration = useRecordStore((s) => s.setDuration);
    const setStatus = useRecordStore((s) => s.setStatus);
    const setActivityType = useRecordStore((s) => s.setActivityType);
    const setCoordinates = useRecordStore((s) => s.setCoordinates);
    const addCoordinate = useRecordStore((s) => s.addCoordinate);
    const setLabel = useRecordStore((s) => s.setLabel);
    const setMode = useRecordStore((s) => s.setMode);

    useEffect(() => {
        const unsubscribe = recordActivityService.onDurationUpdate(
            (duration) => {
                setDuration(duration);
            },
        );

        return () => unsubscribe();
    }, []);

    // Restore persisted activity on mount
    useEffect(() => {
        recordActivityService.restore().then((stored) => {
            if (!stored) return;
            if (stored.computedDuration) setDuration(stored.computedDuration);
            if (stored.activity) setStatus(stored.activity.status);
            if (stored.activity) setActivityType(stored.activity.type);
            if (stored.coordinates) setCoordinates(stored.coordinates);
        });
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
