import { ColView, RowView } from "@/shared/components/CustomView";
import Card from "@/shared/components/ui/Card";
import Icon from "@/shared/components/ui/Icon";
import Text from "@/shared/components/ui/Text";
import { useOnboardingContext } from "@/shared/context/OnboardingContext";
import { activityService } from "@/shared/services/storage/activity.service";
import { coordinateService } from "@/shared/services/storage/coordinates.service";
import { StorageService } from "@/shared/services/storage/storage.service";
import { useProfileStore } from "@/shared/stores/use-profile.store";
import { useSettingsStore } from "@/shared/stores/use-settings-store";
import { NavigationProp } from "@/shared/types/type";
import { cn } from "@/shared/utils/cn";
import { formatCmToftIn } from "@/shared/utils/format";
import { useNavigation } from "@react-navigation/native";
import Constants from "expo-constants";
import { Alert, ScrollView, TouchableOpacity, View } from "react-native";

const version = Constants.expoConfig?.version;
export default function SettingsScreen() {
    const navigation = useNavigation<NavigationProp>();
    const profile = useProfileStore((s) => s.profile);
    const preferences = useSettingsStore((s) => s.settings?.preferences);
    const { setIsOnboarded } = useOnboardingContext();
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
                    description: "Metric or imperial",
                    icon: "speedometer",
                    value: preferences?.unit || "metric",
                    type: "nav",
                    onPress: () => navigation.navigate("Unit" as never),
                    danger: false,
                    visible: false,
                },
            ],
            visible: true,
        },
        {
            title: "Data & Storage",
            items: [
                {
                    label: "Export Data",
                    description: "Download all your activity data as a file",
                    icon: "download-outline" as const,
                    value: undefined,
                    onPress: () => console.log("export data"),
                    type: "action",
                    danger: false,
                    visible: false,
                },
                {
                    label: "Import Data",
                    description: "Restore your data from a backup file",
                    icon: "cloud-upload-outline" as const,
                    value: undefined,
                    onPress: () => console.log("import data"),
                    type: "action",
                    danger: false,
                    visible: false,
                },
                {
                    label: "Clear Activity Data",
                    description: "Permanently delete all recorded sessions",
                    icon: "trash-outline" as const,
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
                    icon: "nuclear-outline" as const,
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
                    visible: true,
                },
            ],
            visible: true,
        },
    ];
    return (
        <ScrollView
            contentContainerStyle={{
                flexGrow: 1,
            }}
        >
            <ColView className="flex-1 gap-0">
                <RowView className="p-4">
                    <RowView className="items-center gap-4">
                        <TouchableOpacity onPress={() => navigation.goBack()}>
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
                                                                        <Text className="text-xs text-muted-foreground">
                                                                            {
                                                                                item.description
                                                                            }
                                                                        </Text>
                                                                    </ColView>
                                                                </RowView>
                                                                {item.type ===
                                                                    "nav" && (
                                                                    <RowView className="items-center">
                                                                        <Text className="text-xs text-primary capitalize">
                                                                            {
                                                                                item.value
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
                                                                )}
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
                <RowView className="items-center justify-center pb-8">
                    <Text className="text-xs text-muted-foreground">
                        Version {version}
                    </Text>
                </RowView>
            </ColView>
        </ScrollView>
    );
}
