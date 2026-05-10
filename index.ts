import { ACTIVITY_BACKGROUND_TASK } from "@/shared/constant/constant";
import "@/shared/services/activity-background-tracking.service";
import { registerRootComponent } from "expo";
import Constants from "expo-constants";
import * as TaskManager from "expo-task-manager";
import "react-native-gesture-handler";
import App from "./App";

console.log("[Startup] appOwnership:", Constants.appOwnership);
console.log("[Startup] TASK NAME constant:", ACTIVITY_BACKGROUND_TASK);

TaskManager.getRegisteredTasksAsync().then((tasks) => {
    console.log(
        "[Startup] All registered tasks:",
        JSON.stringify(tasks, null, 2),
    );
});
// Diagnostic — remove after fix
TaskManager.getRegisteredTasksAsync().then((tasks) => {
    console.log("[Startup] Registered tasks:", JSON.stringify(tasks, null, 2));
    console.log("[Startup] Looking for:", ACTIVITY_BACKGROUND_TASK);
});

registerRootComponent(App);
