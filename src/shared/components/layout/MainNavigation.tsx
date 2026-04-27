import Ionicons from "@expo/vector-icons/Ionicons";
import clsx from "clsx";
import { Href, usePathname, useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { ColView, RowView } from "../CustomView";

export default function MainNavigation() {
    const pathname = usePathname();
    const router = useRouter();
    const menus: {
        label: string;
        href: Href;
        icon: keyof typeof Ionicons.glyphMap;
        active?: boolean;
    }[] = [
        {
            label: "Home",
            href: "/",
            icon: "home",
            active: true,
        },
        {
            label: "Explore",
            href: "/explore",
            icon: "earth",
        },
        {
            label: "Profile",
            href: "/profile",
            icon: "person",
        },
    ];
    const isItemActive = (href: Href) => {
        if (href === "/") return pathname === "/";
        return pathname.startsWith(href.toString());
    };

    const HIDE_ON_THIS_ROUTE = ["/run"];
    if (HIDE_ON_THIS_ROUTE.includes(pathname)) return null;

    return (
        <View className="px-8 h-20 rounded-t-2xl bg-card border border-b-0 border-border">
            <RowView className="flex-1 justify-between items-center">
                {menus.map((menu, index) => {
                    const isActive = isItemActive(menu.href);

                    return (
                        <Pressable
                            key={menu.label}
                            onPress={() => router.push(menu.href)}
                        >
                            <ColView className="gap-1 min-h-12 justify-center items-center">
                                <Ionicons
                                    name={menu.icon}
                                    size={24}
                                    className={clsx(
                                        "text-muted-foreground",
                                        isActive && "text-primary",
                                    )}
                                />
                                <Text
                                    className={clsx(
                                        "text-xs text-muted-foreground",
                                        isActive && "text-primary",
                                    )}
                                >
                                    {menu.label}
                                </Text>
                            </ColView>
                        </Pressable>
                    );
                })}
            </RowView>
        </View>
    );
}
