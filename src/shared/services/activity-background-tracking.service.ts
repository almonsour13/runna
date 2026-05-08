import * as ExpoLocation from "expo-location";
import * as TaskManager from "expo-task-manager";
import { logger } from "../utils/logger";
import { locationService } from "./location.service";

export const ACTIVITY_BACKGROUND_TASK = "ACTIVITY_BACKGROUND_TASK";

TaskManager.defineTask(ACTIVITY_BACKGROUND_TASK, async ({ data, error }) => {
    logger.log("[BGTask] Called");

    if (error) {
        logger.error("[BGTask] Error", { error });
        return;
    }

    if (!data) {
        logger.warn("[BGTask] No data received");
        return;
    }

    const { locations } = data as { locations: ExpoLocation.LocationObject[] };

    if (!locations?.length) {
        logger.warn("[BGTask] Empty locations array");
        return;
    }

    logger.log(`[BGTask] Received ${locations.length} location(s)`);

    locations.forEach((loc) => {
        locationService.emitBackgroundLocation(loc);
    });
});
