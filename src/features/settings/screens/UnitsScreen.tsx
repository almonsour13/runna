import { ColView, RowView } from "@/shared/components/CustomView";
import Icon from "@/shared/components/Icon";
import Card from "@/shared/components/ui/Card";
import Text from "@/shared/components/ui/Text";
import { useSettingsStore } from "@/shared/stores/use-settings-store";
import { UnitMode } from "@/shared/types/type";
import { useNavigation } from "@react-navigation/native";
import { TouchableOpacity, View } from "react-native";

export default function UnitsScreen() {
    const navigation = useNavigation();
    const preferences = useSettingsStore((s) => s.settings?.preferences);
    const unit = preferences?.unit || "metric";
    const setUnit = useSettingsStore((s) => s.setUnit);

    const UNIT_MODE: {
        label: string;
        value: UnitMode;
        icon: string;
    }[] = [
        {
            label: "Metric",
            value: "metric",
            icon: "sunny",
        },
        {
            label: "Imperial",
            value: "imperial",
            icon: "moon",
        },
    ];

    return (
        <ColView className="flex-1 gap-4">
            <RowView className="px-4 pt-8 ">
                <RowView className="gap-4 items-center">
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Icon
                            name="arrow-back"
                            size={24}
                            className="text-foreground"
                        />
                    </TouchableOpacity>
                    <Text className="text-2xl">Unit</Text>
                </RowView>
            </RowView>
            <ColView className="px-4 gap-1">
                {UNIT_MODE.map((item, i) => {
                    const isSelected = unit === item.value;
                    return (
                        <TouchableOpacity
                            key={i}
                            onPress={() => setUnit(item.value)}
                        >
                            <Card className="justify-center h-18">
                                <RowView className="justify-between items-center">
                                    <RowView className="gap-4 items-center">
                                        <View className="bg-muted h-10 w-10 items-center justify-center rounded">
                                            <Icon
                                                name={
                                                    item.icon as keyof typeof Icon.glyphMap
                                                }
                                                size={20}
                                                className="text-foreground"
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
