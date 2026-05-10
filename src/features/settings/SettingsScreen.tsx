import { ColView, RowView } from "@/shared/components/CustomView";
import Card from "@/shared/components/ui/Card";
import Text from "@/shared/components/ui/Text";
import { useProfileStore } from "@/shared/stores/use-profile.store";
import { useSettingsStore } from "@/shared/stores/use-settings-store";
import { NavigationProp } from "@/shared/types/type";
import { cn } from "@/shared/utils/cn";
import { formatCmToftIn } from "@/shared/utils/format";
import { capitalize } from "@/shared/utils/utils";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import Constants from "expo-constants";
import { ScrollView, TouchableOpacity, View } from "react-native";

const version = Constants.expoConfig?.version;
export default function SettingsScreen() {
    const navigation = useNavigation<NavigationProp>();
    const profile = useProfileStore((s) => s.profile);
    const preferences = useSettingsStore((s) => s.preferences);

    const sections = [
        {
            title: "Profile",
            items: [
                {
                    label: profile?.name,
                    description: [
                        profile?.age,
                        profile?.gender && capitalize(profile?.gender),
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
                    value: capitalize(preferences.theme),
                    type: "nav",
                    onPress: () => navigation.navigate("Theme" as never),
                    danger: false,
                    visible: true,
                },
                {
                    label: "Units",
                    description: "Metric or imperial",
                    icon: "speedometer",
                    value: capitalize(preferences.unit),
                    type: "nav",
                    onPress: () => navigation.navigate("Unit" as never),
                    danger: false,
                    visible: false,
                },
            ],
            visible: true,
        },
        {
            title: "Data",
            items: [
                {
                    label: "Clear Activity Data",
                    description: "Permanently delete all recorded sessions",
                    icon: "trash-outline" as const,
                    value: undefined,
                    onPress: () => console.log(""),
                    type: "action",
                    danger: true,
                    visible: true,
                },
                {
                    label: "Reset All Data",
                    description: "Wipe profile, settings, and activity history",
                    icon: "nuclear-outline" as const,
                    value: undefined,
                    onPress: () => console.log(""),
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
            <ColView className="flex-1 gap-4">
                <RowView className="px-4 pt-8 ">
                    <RowView className="gap-4 items-center">
                        <TouchableOpacity onPress={() => navigation.goBack()}>
                            <Ionicons
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
                                                                        <Ionicons
                                                                            name={
                                                                                item.icon as any
                                                                            }
                                                                            size={
                                                                                20
                                                                            }
                                                                            className={cn(
                                                                                "text-foreground",
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
                                                                        <Text className="text-xs text-primary">
                                                                            {
                                                                                item.value
                                                                            }
                                                                        </Text>
                                                                        <Ionicons
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
