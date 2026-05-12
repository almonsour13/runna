import { logger } from "../utils/logger";
import { activityService } from "./storage/activity.service";

export const exportActivity = async (activityId: string) => {
    try {
        const activity = await activityService.getById(activityId);
        if (!activity) {
            throw new Error("Activity not found");
        }
        // const { status } = await MediaLibrary.requestPermissionsAsync();
        // if (status !== "granted") {
        //     throw new Error("Storage permission not granted");
        // }

        // const json = JSON.stringify(activity, null, 2);
        // const fileName = `activity_${activityId}_${Date.now()}.json`;
        // console.log(Object.keys(Paths));
        // const fileUri = `${Paths.document}/${fileName}`;

        // await FileSystem.writeAsStringAsync(fileUri, json, {
        //     encoding: "utf8",
        // });

        // await FileSystem.deleteAsync(fileUri);
    } catch (error) {
        logger.warn("[Export Actvity]: Export failed", error);
        throw error;
    }
};
