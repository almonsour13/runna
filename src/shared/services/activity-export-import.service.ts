import { Directory, File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";
import { activityService } from "./storage/activity.service";
async function saveAndShare(fileName: string, content: string) {
    const activityDir = new Directory(Paths.cache, "activity");
    if (!activityDir.exists) await activityDir.create();

    const targetFile = new File(activityDir, fileName);

    try {
        await targetFile.create();
        await targetFile.write(content);

        if (await Sharing.isAvailableAsync()) {
            await Sharing.shareAsync(targetFile.uri, {
                mimeType: "application/json",
                dialogTitle: "Export Data",
                UTI: "public.json",
            });
        } else {
            throw new Error(
                "Sharing mechanism unavailable on this hardware layer",
            );
        }
    } finally {
        if (targetFile.exists) await targetFile.delete();
    }
}

export async function exportActivityById({ id }: { id: string }) {
    const activity = await activityService.getById(id);
    if (!activity) throw new Error("Activity not found");

    await saveAndShare(
        `activity-${id}.json`,
        JSON.stringify(activity, null, 2),
    );
}

export async function exportAllActivities() {
    const activities = await activityService.get({});
    if (!activities || activities.length === 0)
        throw new Error("Activities not found");

    await saveAndShare("activities.json", JSON.stringify(activities, null, 2));
}

export async function importActivities() {
    // const result = await DocumentPicker.getDocumentAsync({
    //     type: ["application/json"],
    //     copyToCacheDirectory: true,
    // });
    // if (result.canceled || !result.assets) return null;
    // const selectedFile = result.assets[0];
    // const rawContent = await FileSystem.readAsStringAsync(selectedFile.uri, {
    //     encoding: FileSystem.File.,
    // });
    // return JSON.parse(rawContent);
}
