import { ColView, RowView } from "@/shared/components/CustomView";
import Card from "@/shared/components/ui/Card";
import Icon from "@/shared/components/ui/Icon";
import Text from "@/shared/components/ui/Text";
import { cn } from "@/shared/utils/cn";
import * as Location from "expo-location";
import * as MediaLibrary from "expo-media-library";
import * as Notifications from "expo-notifications";
import { Accelerometer, Pedometer } from "expo-sensors";
import { useEffect } from "react";
import { Dimensions, TouchableOpacity, View } from "react-native";
import { Permissions } from "../screens/OnboardingStepsScreen";

const { width } = Dimensions.get("window");

type PermissionStatus = "granted" | "denied" | "idle";

function StatusIcon({ status }: { status: PermissionStatus }) {
    if (status === "granted") {
        return (
            <Icon name="checkmark-circle" size={20} className="text-primary" />
        );
    }
    if (status === "denied") {
        return <Icon name="close-circle" size={20} className="text-red-500" />;
    }
    return (
        <Icon
            name="ellipse-outline"
            size={20}
            className="text-muted-foreground"
        />
    );
}

export default function PermissionStep({
    step,
    permissions,
    setPermissions,
}: {
    step: string;
    permissions: Permissions;
    setPermissions: React.Dispatch<React.SetStateAction<Permissions>>;
}) {
    useEffect(() => {
        async function requestAllPermissions() {
            const [
                location,
                notifications,
                photos,
                [accelerometer, pedometer],
            ] = await Promise.all([
                Location.requestForegroundPermissionsAsync(),
                Notifications.requestPermissionsAsync(),
                MediaLibrary.requestPermissionsAsync(),
                Promise.all([
                    Accelerometer.requestPermissionsAsync(),
                    Pedometer.requestPermissionsAsync(),
                ]),
            ]);

            const sensorGranted = accelerometer.granted || pedometer.granted;
            const sensorCanAskAgain =
                accelerometer.canAskAgain || pedometer.canAskAgain;

            setPermissions({
                location: location.granted
                    ? "granted"
                    : location.canAskAgain
                      ? "idle"
                      : "denied",
                notifications: notifications.granted
                    ? "granted"
                    : notifications.canAskAgain
                      ? "idle"
                      : "denied",
                photos: photos.granted
                    ? "granted"
                    : photos.canAskAgain
                      ? "idle"
                      : "denied",
                sensor: sensorGranted
                    ? "granted"
                    : sensorCanAskAgain
                      ? "idle"
                      : "denied",
            });
        }
        if (
            step === "Permission" &&
            Object.values(permissions).some((status) => status === "idle")
        ) {
            requestAllPermissions();
            console.log("Requesting permissions...");
        }
    }, [step]);

    const permissionsList = [
        {
            name: "Location",
            description: "Track your runs and show how far you've gone.",
            icon: "location",
            status: permissions.location,
            onRequest: async () => {
                const { status } =
                    await Location.requestForegroundPermissionsAsync();
                setPermissions((prev) => ({
                    ...prev,
                    location:
                        status === "granted"
                            ? "granted"
                            : status === "denied"
                              ? "denied"
                              : "idle",
                }));
            },
            visible: true,
        },
        {
            name: "Notifications",
            description: "Get reminders and celebrate when you hit your goal.",
            icon: "notifications",
            status: permissions.notifications,
            onRequest: async () => {
                const { status } =
                    await Notifications.requestPermissionsAsync();
                setPermissions((prev) => ({
                    ...prev,
                    notifications:
                        status === "granted"
                            ? "granted"
                            : status === "denied"
                              ? "denied"
                              : "idle",
                }));
            },
            visible: true,
        },
        {
            name: "Photo Library",
            description: "Save run photos and share them with friends.",
            icon: "image",
            status: permissions.photos,
            onRequest: async () => {
                const { status } = await MediaLibrary.requestPermissionsAsync();
                setPermissions((prev) => ({
                    ...prev,
                    photos:
                        status === "granted"
                            ? "granted"
                            : status === "denied"
                              ? "denied"
                              : "idle",
                }));
            },
            visible: true,
        },
        {
            name: "Motion & Sensors",
            description: "Count your steps and track activity accurately.",
            icon: "footsteps",
            status: permissions.sensor,
            onRequest: async () => {
                const [accel, pedo] = await Promise.all([
                    Accelerometer.requestPermissionsAsync(),
                    Pedometer.requestPermissionsAsync(),
                ]);
                const granted =
                    accel.status === "granted" || pedo.status === "granted";
                const denied =
                    accel.status === "denied" && pedo.status === "denied";
                setPermissions((prev) => ({
                    ...prev,
                    sensor: granted ? "granted" : denied ? "denied" : "idle",
                }));
            },
            visible: true,
        },
    ];

    return (
        <ColView className="flex-1 gap-4" style={{ width }}>
            <ColView className="px-4 justify-center gap-4">
                <Text className="text-4xl font-semibold">
                    Allow access{"\n"}to get started
                </Text>
                <Text className="text-base text-muted-foreground leading-relaxed">
                    We need a couple of permissions to track your steps and keep
                    you motivated.
                </Text>
            </ColView>
            <ColView className="px-4 gap-2">
                {permissionsList
                    .filter((perm) => perm.visible)
                    .map((perm) => {
                        const { name, description, icon, status, onRequest } =
                            perm;
                        const isDenied = status === "denied";

                        return (
                            <TouchableOpacity
                                key={name}
                                onPress={onRequest}
                                disabled={isDenied}
                            >
                                <Card
                                    className={cn(
                                        "justify-center h-18",
                                        isDenied && "opacity-50",
                                    )}
                                >
                                    <RowView className="items-center gap-3">
                                        <View className="bg-muted h-10 w-10 items-center justify-center rounded">
                                            <Icon
                                                name={icon as any}
                                                size={20}
                                                className="text-primary"
                                            />
                                        </View>
                                        <ColView className="flex-1 gap-0.5">
                                            <Text className="font-medium">
                                                {name}
                                            </Text>
                                            <Text className="text-xs text-muted-foreground">
                                                {isDenied
                                                    ? "Permission denied. Enable it in Settings."
                                                    : description}
                                            </Text>
                                        </ColView>
                                        <StatusIcon status={status} />
                                    </RowView>
                                </Card>
                            </TouchableOpacity>
                        );
                    })}
            </ColView>
        </ColView>
    );
}
