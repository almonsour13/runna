import { ToastAndroid } from "react-native";
import { activityTrackingService } from "../services/activity-tracking.service";
import { useActivityTrackingStore } from "../stores/use-activity-tracking.store";
import { useActivityStore } from "../stores/use-activity.store";

export const useAcitivityTrackingController = () => {
    const activity = useActivityTrackingStore((s) => s.activity);
    const status = activity.status;
    const setStatus = useActivityTrackingStore((s) => s.setStatus);
    const addActivity = useActivityStore((s) => s.addActivity);
    const clearActivity = useActivityTrackingStore((s) => s.clearActivity);

    const start = async () => {
        if (status !== "idle") return;
        setStatus("active");
        activityTrackingService.start();
        ToastAndroid.show("Activity started", ToastAndroid.LONG);
    };

    const pause = async () => {
        if (status !== "active") return;
        setStatus("paused");
        activityTrackingService.pause();
        ToastAndroid.show("Activity paused", ToastAndroid.LONG);
    };

    const resume = async () => {
        if (status !== "paused") return;
        setStatus("active");
        activityTrackingService.resume();
        ToastAndroid.show("Activity resumed", ToastAndroid.LONG);
    };

    const stop = async () => {
        clearActivity();
        const newActivity = await activityTrackingService.stop();
        addActivity(newActivity);
        ToastAndroid.show("Activity stopped", ToastAndroid.LONG);
    };

    const reset = async () => {
        clearActivity();
        activityTrackingService.discard();
        ToastAndroid.show("Activity reset", ToastAndroid.LONG);
    };

    return {
        start,
        pause,
        resume,
        stop,
        reset,
    };
};
