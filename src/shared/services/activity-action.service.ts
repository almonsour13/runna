import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { logger } from "../utils/logger";
import { activityService } from "./storage/activity.service";

class ActivityActionService {
    /**
     * Create export file (shared logic)
     */
    private async createExportFile(activityId: string) {
        const activity = await activityService.getById(activityId);

        if (!activity) {
            throw new Error("Activity not found");
        }

        const coordinates =
            await activityService.getCoordinatesByActivityId(activityId);

        const json = JSON.stringify({ ...activity, coordinates }, null, 2);

        const fileUri = `${FileSystem.cacheDirectory}${activityId}.json`;

        await FileSystem.writeAsStringAsync(fileUri, json, {
            encoding: FileSystem.EncodingType.UTF8,
        });

        const cleanup = () =>
            FileSystem.deleteAsync(fileUri, { idempotent: true });

        return { fileUri, json, cleanup };
    }

    /**
     * SHARE → opens native share sheet
     */
    async share(activityId: string) {
        const { fileUri, cleanup } = await this.createExportFile(activityId);

        try {
            const isAvailable = await Sharing.isAvailableAsync();
            if (!isAvailable) {
                throw new Error("SHARING_UNAVAILABLE");
            }

            await Sharing.shareAsync(fileUri, {
                mimeType: "application/json",
                dialogTitle: "Share Activity",
                UTI: "public.json", // iOS only
            });
        } catch (error) {
            logger.warn("[ActivityActionService]: Share failed", error);
        } finally {
            await cleanup();
        }
    }

    /**
     * DOWNLOAD → opens native share sheet (Android + iOS)
     * SAF is avoided because the Downloads root is not writable via SAF.
     */
    async download(activityId: string) {
        const { fileUri, cleanup } = await this.createExportFile(activityId);

        try {
            const isAvailable = await Sharing.isAvailableAsync();
            if (!isAvailable) {
                throw new Error("SHARING_UNAVAILABLE");
            }

            await Sharing.shareAsync(fileUri, {
                mimeType: "application/json",
                dialogTitle: "Save Activity",
                UTI: "public.json", // iOS only
            });
        } catch (error) {
            logger.warn("[ActivityActionService]: Download failed", error);
        } finally {
            await cleanup();
        }
    }
}

export const activityActionService = new ActivityActionService();
