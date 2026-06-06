import { ColView, RowView } from "@/shared/components/CustomView";
import Card from "@/shared/components/ui/Card";
import Icon from "@/shared/components/ui/Icon";
import Text from "@/shared/components/ui/Text";
import { settingsService } from "@/shared/services/storage/settings.service";
import { useSettingsStore } from "@/shared/stores/use-settings-store";
import { ThemeMode } from "@/shared/types/type";
import { useNavigation } from "@react-navigation/native";
import { TouchableOpacity, View } from "react-native";

export default function ThemeScreen() {
    const navigation = useNavigation();
    const preferences = useSettingsStore((s) => s.settings?.preferences);
    const theme = preferences?.theme || "system";
    const setTheme = useSettingsStore((s) => s.setTheme);

    const THEME_MODE: {
        label: string;
        value: ThemeMode;
        icon: string;
    }[] = [
        {
            label: "Light",
            value: "light",
            icon: "sunny",
        },
        {
            label: "Dark",
            value: "dark",
            icon: "moon",
        },
        {
            label: "System",
            value: "system",
            icon: "phone-portrait",
        },
    ];

    const handleSelectTheme = async (theme: ThemeMode) => {
        await settingsService
            .update({
                preferences: {
                    ...preferences,
                    theme,
                },
            })
            .then(() => {
                setTheme(theme);
                navigation.goBack();
            });
    };

    return (
        <ColView className="flex-1 gap-0">
            <RowView className="p-4">
                <RowView className="gap-4 items-center">
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Icon
                            name="arrow-back"
                            size={24}
                            className="text-foreground"
                        />
                    </TouchableOpacity>
                    <Text className="text-2xl">Theme</Text>
                </RowView>
            </RowView>
            <ColView className="px-4 gap-1">
                {THEME_MODE.map((item, i) => {
                    const isSelected = theme === item.value;
                    return (
                        <TouchableOpacity
                            key={i}
                            onPress={() => handleSelectTheme(item.value)}
                        >
                            <Card className="justify-center h-18">
                                <RowView className="justify-between items-center">
                                    <RowView className="gap-4 items-center">
                                        <View className="bg-muted h-10 w-10 items-center justify-center rounded">
                                            <Icon
                                                name={item.icon}
                                                size={20}
                                                className="text-primary"
                                            />
                                        </View>
                                        <Text className="text-base">
                                            {item.label}
                                        </Text>
                                    </RowView>
                                    {isSelected && (
                                        <Icon
                                            name="checkmark"
                                            size={20}
                                            className="text-primary"
                                        />
                                    )}
                                </RowView>
                            </Card>
                        </TouchableOpacity>
                    );
                })}
            </ColView>
        </ColView>
    );
}
