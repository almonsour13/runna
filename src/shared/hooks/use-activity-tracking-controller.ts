import { activityTrackingService } from "../services/activity-tracking.service";
import { useActivityTrackingStore } from "../stores/use-activity-tracking.store";

export const useAcitivityTrackingController = () => {
    const activity = useActivityTrackingStore((s) => s.activity);
    const status = activity.status;
    const setStatus = useActivityTrackingStore((s) => s.setStatus);
    const setActivity = useActivityTrackingStore((s) => s.setActivity);

    const start = async () => {
        if (status !== "idle") return;
        setStatus("active");
        activityTrackingService.start();
    };

    const pause = async () => {
        if (status !== "active") return;
        setStatus("paused");
        activityTrackingService.pause();
    };

    const resume = async () => {
        if (status !== "paused") return;
        setStatus("active");
        activityTrackingService.resume();
    };

    const stop = async () => {
        setStatus("idle");
        activityTrackingService.stop();
        setActivity({
            duration: 0,
            status: "idle",
        });
    };

    const reset = async () => {
        setStatus("idle");
        setActivity({
            duration: 0,
            status: "idle",
        });
        activityTrackingService.discard();
    };

    return {
        start,
        pause,
        resume,
        stop,
        reset,
    };
};
