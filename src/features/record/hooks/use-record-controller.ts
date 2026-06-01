import { useActivityMutations } from "../../../shared/hooks/use-activity-mutation";
import { recordActivityService } from "../../../shared/services/record-activity.service";
import { useRecordStore } from "../../../shared/stores/use-record.store";

export const useRecordController = () => {
    const activityType = useRecordStore((s) => s.activityType);
    const status = useRecordStore((s) => s.status);
    const setStatus = useRecordStore((s) => s.setStatus);
    const setMode = useRecordStore((s) => s.setMode);
    const clearActivity = useRecordStore((s) => s.clearActivity);
    const { invalidate } = useActivityMutations();

    const start = async () => {
        if (status !== "idle") return;
        try {
            await recordActivityService.start(activityType);
            setStatus("active");
            setMode("recording");
        } catch (error) {
            // Roll back — service failed, keep UI as idle
            setStatus("idle");
            throw error;
        }
    };

    const pause = async () => {
        if (status !== "active") return;
        try {
            await recordActivityService.pause();
            setStatus("paused");
            setMode("preview");
        } catch (error) {
            // Roll back — service failed, keep UI as active
            setStatus("active");
            throw error;
        }
    };

    const resume = async () => {
        if (status !== "paused") return;
        try {
            await recordActivityService.resume();
            setStatus("active");
            setMode("recording");
        } catch (error) {
            // Roll back — service failed, keep UI as paused
            setStatus("paused");
            throw error;
        }
    };

    const stop = async () => {
        if (status !== "active" && status !== "paused") return;
        try {
            await recordActivityService.stop();
            clearActivity();
            invalidate();
        } catch (error) {
            // Do NOT clear state — let user retry or discard manually
            throw error;
        }
    };

    const reset = async () => {
        try {
            await recordActivityService.discard();
        } catch (error) {
            // Discard best-effort; always clear local state regardless
            throw error;
        } finally {
            // Always clear UI state even if service throws,
            // so the user is never stuck on a stale screen
            clearActivity();
        }
    };

    return {
        start,
        pause,
        resume,
        stop,
        reset,
    };
};
