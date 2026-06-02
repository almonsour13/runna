import { ColView, RowView } from "@/shared/components/CustomView";
import Card from "@/shared/components/ui/Card";
import Icon from "@/shared/components/ui/Icon";
import Text from "@/shared/components/ui/Text";
import { cn } from "@/shared/utils/cn";
import { TouchableOpacity } from "react-native";
import { TABS, useStatisticContext } from "../context/StatisticContext";

export default function StatisticTabs() {
    const { activeTab, setActiveTab, offset, setOffset, rangeLabel } =
        useStatisticContext();

    const handleSelectTab = (tab: (typeof TABS)[number]) => {
        setActiveTab(tab);
        setOffset(0);
    };

    const isPrevDisabled = activeTab === "All Time";
    const isNextDisabled = activeTab === "All Time" || offset === 0;

    return (
        <ColView className="px-4 gap-2">
            <RowView className="gap-1">
                {TABS.map((tab) => {
                    return (
                        <TouchableOpacity
                            key={tab}
                            onPress={() => handleSelectTab(tab)}
                            className="flex-1"
                        >
                            <Card
                                className={cn(
                                    "items-center justify-center p-2",
                                    activeTab === tab && "bg-primary",
                                )}
                            >
                                <Text
                                    className={cn(
                                        "text-sm",
                                        activeTab === tab && "text-white",
                                    )}
                                >
                                    {tab}
                                </Text>
                            </Card>
                        </TouchableOpacity>
                    );
                })}
            </RowView>
            {activeTab !== "All Time" && (
                <RowView className="gap-2 justify-between items-center">
                    <TouchableOpacity
                        onPress={() => setOffset((o) => o - 1)}
                        disabled={isPrevDisabled}
                    >
                        <Card
                            className={cn(
                                "items-center justify-center p-2",
                                isPrevDisabled && "opacity-75",
                            )}
                        >
                            <Icon name="chevron-back" size={20} />
                        </Card>
                    </TouchableOpacity>
                    <Text className="text-lg font-medium">{rangeLabel}</Text>
                    <TouchableOpacity
                        onPress={() => setOffset((o) => o + 1)}
                        disabled={isNextDisabled}
                    >
                        <Card
                            className={cn(
                                "items-center justify-center p-2",
                                isNextDisabled && "opacity-50",
                            )}
                        >
                            <Icon name="chevron-forward" size={20} />
                        </Card>
                    </TouchableOpacity>
                </RowView>
            )}
        </ColView>
    );
}
