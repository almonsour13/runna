import { activityTrackingService } from "../services/activity-tracking.service";
import { useActivityTrackingStore } from "../stores/use-activity-tracking.store";
import { useActivityMutations } from "./use-activity-mutation";

export const useAcitivityTrackingController = () => {
    const status = useActivityTrackingStore((s) => s.status);
    const setStatus = useActivityTrackingStore((s) => s.setStatus);
    const setMode = useActivityTrackingStore((s) => s.setMode);
    const clearActivity = useActivityTrackingStore((s) => s.clearActivity);
    const { invalidate } = useActivityMutations();
    const start = async () => {
        if (status !== "idle") return;
        setStatus("active");
        setMode("recording");
        await activityTrackingService.start();
    };

    const pause = async () => {
        if (status !== "active") return;
        setStatus("paused");
        setMode("preview");
        await activityTrackingService.pause();
    };

    const resume = async () => {
        if (status !== "paused") return;
        setStatus("active");
        setMode("recording");
        await activityTrackingService.resume();
    };

    const stop = async () => {
        setMode("preview");
        clearActivity();
        await activityTrackingService.stop().then(() => {
            invalidate();
        });
    };

    const reset = async () => {
        setMode("preview");
        clearActivity();
        await activityTrackingService.discard();
    };

    return {
        start,
        pause,
        resume,
        stop,
        reset,
    };
};
