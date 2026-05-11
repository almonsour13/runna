import * as ExpoLocation from "expo-location";
import * as TaskManager from "expo-task-manager";
import { ACTIVITY_BACKGROUND_TASK } from "../constant/constant";
import { logger } from "../utils/logger";

console.log("[BGTask] Imports done, about to defineTask...");
type EmitFn = (location: ExpoLocation.LocationObject) => void;

let emitLocation: EmitFn = () => {
    logger.warn(
        "[BGTask] emitLocation called before LocationService registered it",
    );
};

export function registerBackgroundEmitter(fn: EmitFn): void {
    emitLocation = fn;
}

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

    locations.forEach((loc) => emitLocation(loc));
});

TaskManager.getRegisteredTasksAsync().then((tasks) => {
    console.log(
        "[BGTask] Tasks after defineTask:",
        JSON.stringify(tasks, null, 2),
    );
});

console.log("[BGTask] defineTask complete");
