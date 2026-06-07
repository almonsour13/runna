import { ColView, RowView } from "@/shared/components/CustomView";
import GoalDrawer from "@/shared/components/drawer/GoalDrawer";
import MapStyleDrawer from "@/shared/components/drawer/MapStyleDrawer";
import UnitDrawer from "@/shared/components/drawer/UnitDrawer";
import Card from "@/shared/components/ui/Card";
import { DrawerHandle } from "@/shared/components/ui/Drawer";
import Icon from "@/shared/components/ui/Icon";
import Text from "@/shared/components/ui/Text";
import { useOnboardingContext } from "@/shared/context/OnboardingContext";
import { useUnit } from "@/shared/hooks/use-unit";
import { exportAllActivities } from "@/shared/services/activity-export-import.service";
import { activityService } from "@/shared/services/storage/activity.service";
import { coordinateService } from "@/shared/services/storage/coordinates.service";
import { settingsService } from "@/shared/services/storage/settings.service";
import { StorageService } from "@/shared/services/storage/storage.service";
import { useProfileStore } from "@/shared/stores/use-profile.store";
import { useSettingsStore } from "@/shared/stores/use-settings-store";
import { NavigationProp, Preferences } from "@/shared/types/type";
import { cn } from "@/shared/utils/cn";
import { formatCmToftIn } from "@/shared/utils/format";
import { useNavigation } from "@react-navigation/native";
import Constants from "expo-constants";
import { useRef } from "react";
import {
    Alert,
    ScrollView,
    Switch,
    TouchableOpacity,
    View,
} from "react-native";

const version = Constants.expoConfig?.version;
export default function SettingsScreen() {
    const navigation = useNavigation<NavigationProp>();
    const profile = useProfileStore((s) => s.profile);
    const settings = useSettingsStore((s) => s.settings);
    const preferences = settings.preferences;
    const mapStyle = preferences.mapStyle;
    const updatePreferences = useSettingsStore((s) => s.updatePreferences);

    const handleChange = async (key: keyof Preferences, value: any) => {
        updatePreferences({ [key]: value });
        await settingsService.save({
            preferences: { ...preferences, [key]: value },
        });
    };

    const { setIsOnboarded } = useOnboardingContext();
    const goalDrawerRef = useRef<DrawerHandle>(null);
    const unitDrawerRef = useRef<DrawerHandle>(null);
    const mapStyleDrawerRef = useRef<DrawerHandle>(null);

    const sections = [
        {
            title: "Profile",
            items: [
                {
                    label: profile?.name,
                    description: [
                        profile?.age,
                        profile?.gender && profile?.gender,
                        profile?.height && formatCmToftIn(profile?.height),
                        profile?.weight + " kg",
                    ]
                        .filter(Boolean)
                        .join(" • "),
                    icon: "person",
                    value: "Edit",
                    type: "nav",
                    onPress: () =>
                        navigation.navigate("Profile", {
                            screen: "ProfileEdit",
                        }),
                    danger: false,
                    visible: true,
                },
            ],
            visible: true,
        },
        {
            title: "Preferences",
            items: [
                {
                    label: "Theme",
                    description: "Light, dark, or system mode",
                    icon: "moon",
                    value: preferences?.theme || "system",
                    type: "nav",
                    onPress: () => navigation.navigate("Theme" as never),
                    danger: false,
                    visible: true,
                },
                {
                    label: "Units",
                    description: "Meters, Kilometers or Miles",
                    icon: "speedometer",
                    value: preferences?.unit || "metric",
                    type: "nav",
                    onPress: () => {
                        unitDrawerRef.current?.open();
                    },
                    danger: false,
                    visible: true,
                },
                {
                    label: "Goal",
                    description: "Daily distance target",
                    icon: "flag",
                    value: preferences?.goal
                        ? useUnit(preferences?.goal).value
                        : "Not set",
                    type: "nav",
                    onPress: () => goalDrawerRef.current?.open(),
                    danger: false,
                    visible: true,
                },
                {
                    label: "Map Style",
                    description: "Choose map appearance",
                    icon: "map",
                    value: mapStyle ?? "Streets",
                    type: "nav",
                    onPress: () => mapStyleDrawerRef.current?.open(),
                    danger: false,
                    visible: true,
                },
            ],
            visible: true,
        },
        {
            title: "Notifications",
            items: [
                {
                    label: "Goal Reached",
                    description: "Notify when distance goal is achieved",
                    icon: "trophy",
                    value: false,
                    type: "toggle",
                    onPress: () => {},
                    danger: false,
                    visible: __DEV__,
                },
            ],
            visible: __DEV__,
        },

        {
            title: "Data & Storage",
            items: [
                {
                    label: "Export Data (Json)",
                    description: "Download all your activity data as a file",
                    icon: "download" as const,
                    value: undefined,
                    onPress: async () => await exportAllActivities(),
                    type: "action",
                    danger: false,
                    visible: __DEV__,
                },
                {
                    label: "Import Data",
                    description: "Restore your data from a backup file",
                    icon: "cloud-upload" as const,
                    value: undefined,
                    onPress: () => console.log("import data"),
                    type: "action",
                    danger: false,
                    visible: __DEV__,
                },
                {
                    label: "Clear Activity Data",
                    description: "Permanently delete all recorded sessions",
                    icon: "trash" as const,
                    value: undefined,
                    onPress: async () => {
                        Alert.alert(
                            "Clear Activity Data",
                            "This will permanently delete all recorded sessions. You'll be taken back to onboarding. This cannot be undone.",
                            [
                                { text: "Cancel", style: "cancel" },
                                {
                                    text: "Clear",
                                    style: "destructive",
                                    onPress: async () => {
                                        await activityService.clear();
                                        await coordinateService.clear();
                                    },
                                },
                            ],
                        );
                    },
                    type: "action",
                    danger: true,
                    visible: true,
                },
                {
                    label: "Reset All Data",
                    description: "Wipe profile, settings, and activity history",
                    icon: "nuclear" as const,
                    value: undefined,
                    onPress: async () => {
                        Alert.alert(
                            "Reset All Data",
                            "This will delete your profile, settings, and all activity history. You'll be taken back to onboarding. This cannot be undone.",
                            [
                                { text: "Cancel", style: "cancel" },
                                {
                                    text: "Reset",
                                    style: "destructive",
                                    onPress: async () => {
                                        await StorageService.resetAll();
                                        setIsOnboarded(false);
                                        setTimeout(() => {
                                            navigation.navigate("Onboarding", {
                                                screen: "OnboardingScreen",
                                            });
                                        }, 1000);
                                    },
                                },
                            ],
                        );
                    },
                    type: "action",
                    danger: true,
                    visible: __DEV__,
                },
            ],
            visible: true,
        },
    ];
    return (
        <>
            <ScrollView
                contentContainerStyle={{
                    flexGrow: 1,
                }}
            >
                <ColView className="flex-1 gap-0">
                    <RowView className="p-4">
                        <RowView className="items-center gap-4">
                            <TouchableOpacity
                                onPress={() => navigation.goBack()}
                            >
                                <Icon
                                    name="arrow-back"
                                    size={24}
                                    className="text-foreground"
                                />
                            </TouchableOpacity>
                            <Text className="text-2xl">Settings</Text>
                        </RowView>
                    </RowView>
                    <ColView className="flex-1 px-4">
                        {sections
                            .filter((section) => section.visible)
                            .map((section, i) => {
                                const items = section.items;
                                return (
                                    <ColView key={i}>
                                        <Text className="text-sm text-muted-foreground">
                                            {section.title}
                                        </Text>
                                        <ColView className="gap-1">
                                            {items
                                                .filter((item) => item.visible)
                                                .map((item, it) => {
                                                    const isDanger =
                                                        item.danger === true;
                                                    const isToggle =
                                                        item.type === "toggle";
                                                    return (
                                                        <TouchableOpacity
                                                            key={it}
                                                            onPress={() =>
                                                                item.onPress()
                                                            }
                                                        >
                                                            <Card className="justify-center h-18">
                                                                <RowView className="justify-between items-center">
                                                                    <RowView className="gap-4 items-center">
                                                                        <View className="bg-muted h-10 w-10 items-center justify-center rounded">
                                                                            <Icon
                                                                                name={
                                                                                    item.icon
                                                                                }
                                                                                size={
                                                                                    20
                                                                                }
                                                                                className={cn(
                                                                                    "text-primary",
                                                                                    isDanger &&
                                                                                        "text-destructive",
                                                                                )}
                                                                            />
                                                                        </View>
                                                                        <ColView className="gap-0">
                                                                            <Text
                                                                                className={cn(
                                                                                    "text-base",
                                                                                    isDanger &&
                                                                                        "text-destructive",
                                                                                )}
                                                                            >
                                                                                {
                                                                                    item.label
                                                                                }
                                                                            </Text>
                                                                            <Text className="text-xs text-muted-foreground capitalize">
                                                                                {
                                                                                    item.description
                                                                                }
                                                                            </Text>
                                                                        </ColView>
                                                                    </RowView>
                                                                    {isToggle ? (
                                                                        <Switch
                                                                            value={
                                                                                item.value as boolean
                                                                            }
                                                                            onValueChange={() =>
                                                                                item.onPress()
                                                                            }
                                                                        />
                                                                    ) : item.type ===
                                                                      "nav" ? (
                                                                        <RowView className="items-center">
                                                                            <Text className="text-xs text-primary capitalize">
                                                                                {
                                                                                    item.value as string
                                                                                }
                                                                            </Text>
                                                                            <Icon
                                                                                name="chevron-forward"
                                                                                size={
                                                                                    16
                                                                                }
                                                                                className="text-muted-foreground"
                                                                            />
                                                                        </RowView>
                                                                    ) : null}
                                                                </RowView>
                                                            </Card>
                                                        </TouchableOpacity>
                                                    );
                                                })}
                                        </ColView>
                                    </ColView>
                                );
                            })}
                    </ColView>
                    <RowView className="items-center justify-center py-8 pb-4">
                        <Text className="text-xs text-muted-foreground">
                            Version {version}
                        </Text>
                    </RowView>
                </ColView>
            </ScrollView>
            <GoalDrawer
                ref={goalDrawerRef}
                value={preferences?.goal}
                onChange={(v) => handleChange("goal", v)}
            />
            <UnitDrawer
                ref={unitDrawerRef}
                value={preferences?.unit}
                onChange={(v) => handleChange("unit", v)} // ✅ fixed key
            />

            <MapStyleDrawer
                value={mapStyle}
                onChange={(v) => {
                    handleChange("mapStyle", v);
                }}
                ref={mapStyleDrawerRef}
            />
        </>
    );
}
