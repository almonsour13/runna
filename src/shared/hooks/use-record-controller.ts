import { recordActivityService } from "../services/record-activity.service";
import { useRecordStore } from "../stores/use-record.store";
import { useActivityMutations } from "./use-activity-mutation";

export const useRecordController = () => {
    const activityType = useRecordStore((s) => s.activityType);
    const status = useRecordStore((s) => s.status);
    const setStatus = useRecordStore((s) => s.setStatus);
    const clearActivity = useRecordStore((s) => s.clearActivity);
    const { invalidate } = useActivityMutations();
    const start = async () => {
        if (status !== "idle") return;
        setStatus("active");
        await recordActivityService.start(activityType);
    };

    const pause = async () => {
        if (status !== "active") return;
        setStatus("paused");
        await recordActivityService.pause();
    };

    const resume = async () => {
        if (status !== "paused") return;
        setStatus("active");
        await recordActivityService.resume();
    };

    const stop = async () => {
        clearActivity();
        await recordActivityService.stop().then(() => {
            invalidate();
        });
    };

    const reset = async () => {
        clearActivity();
        await recordActivityService.discard();
    };

    return {
        start,
        pause,
        resume,
        stop,
        reset,
    };
};
