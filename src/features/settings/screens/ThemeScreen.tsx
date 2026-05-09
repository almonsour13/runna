import { ColView, RowView } from "@/shared/components/CustomView";
import Text from "@/shared/components/ui/Text";
import {
    ThemeMode,
    useSettingsStore,
} from "@/shared/stores/use-settings-store";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { TouchableOpacity, View } from "react-native";

export default function ThemeScreen() {
    const navigation = useNavigation();
    const theme = useSettingsStore((s) => s.preferences.theme);
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

    return (
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
            <ColView className="px-4 gap-0">
                {THEME_MODE.map((item, i) => {
                    const isSelected = theme === item.value;
                    return (
                        <TouchableOpacity
                            key={i}
                            onPress={() => setTheme(item.value)}
                        >
                            <RowView className="h-16 justify-between items-center px-4 py-2 bg-card">
                                <RowView className="gap-4 items-center">
                                    <View className="bg-muted h-10 w-10 items-center justify-center rounded">
                                        <Ionicons
                                            name={item.icon as any}
                                            size={20}
                                            className="text-foreground"
                                        />
                                    </View>
                                    <Text className="text-base">
                                        {item.label}
                                    </Text>
                                </RowView>
                                {isSelected && (
                                    <Ionicons
                                        name="checkmark"
                                        size={20}
                                        className="text-primary"
                                    />
                                )}
                            </RowView>
                        </TouchableOpacity>
                    );
                })}
            </ColView>
        </ColView>
    );
}
