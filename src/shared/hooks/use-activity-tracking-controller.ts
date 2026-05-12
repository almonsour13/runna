import { activityTrackingService } from "../services/activity-tracking.service";
import { useActivityTrackingStore } from "../stores/use-activity-tracking.store";
import { useActivityStore } from "../stores/use-activity.store";

export const useAcitivityTrackingController = () => {
    const status = useActivityTrackingStore((s) => s.status);
    const setStatus = useActivityTrackingStore((s) => s.setStatus);
    const setMode = useActivityTrackingStore((s) => s.setMode);
    const addActivity = useActivityStore((s) => s.addActivity);
    const clearActivity = useActivityTrackingStore((s) => s.clearActivity);

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
        const newActivity = await activityTrackingService.stop();
        addActivity(newActivity);
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
