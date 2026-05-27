import { cn } from "@/shared/utils/cn";
import clsx from "clsx";
import { memo } from "react";
import { TouchableOpacity, View } from "react-native";
import ActivityButton from "../ActivityButton";
import { ColView, RowView } from "../CustomView";
import Icon from "../Icon";
import Card from "../ui/Card";
import Text from "../ui/Text";

function MainTabBar({ state, navigation }: { state: any; navigation: any }) {
    const tabs = [
        {
            label: "Home",
            icon: "home",
            visible: true,
        },
        {
            label: "Statistic",
            icon: "bar-chart",
            visible: true,
        },
        {
            label: "History",
            icon: "time",
            visible: true,
        },
        {
            label: "Settings",
            icon: "settings",
            visible: true,
        },
    ];

    return (
        <RowView className="absolute bottom-0 left-0 right-0 p-4 justify-center items-center">
            <RowView className="justify-between">
                {tabs
                    .filter((tab) => tab.visible)
                    .map((tab, index) => {
                        const isActive = state.index === index;
                        return (
                            <TouchableOpacity
                                key={tab.label}
                                onPress={() => navigation.navigate(tab.label)}
                                activeOpacity={0.9}
                            >
                                <Card
                                    className={cn(
                                        "h-16 aspect-square justify-center items-center border border-border",
                                        // isActive && "bg-primary-foreground",
                                    )}
                                >
                                    <ColView className="gap-2 justify-center items-center ">
                                        <Icon
                                            name={tab.icon as any}
                                            size={24}
                                            className={clsx(
                                                "text-muted-foreground",
                                                isActive && "text-primary",
                                            )}
                                        />
                                        <View
                                            className={clsx(
                                                "hidden h-2 aspect-square rounded-full bg-primary",
                                                !isActive && "hidden",
                                            )}
                                        />
                                        <Text
                                            className={clsx(
                                                "hidden text-xs text-muted-foreground",
                                                isActive && "text-primary",
                                            )}
                                        >
                                            {tab.label}
                                        </Text>
                                    </ColView>
                                </Card>
                            </TouchableOpacity>
                        );
                    })}
            </RowView>
            <ActivityButton />
        </RowView>
    );
}

export default memo(MainTabBar);
