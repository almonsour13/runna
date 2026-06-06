import { ColView, RowView } from "@/shared/components/CustomView";
import Card from "@/shared/components/ui/Card";
import Icon from "@/shared/components/ui/Icon";
import Text from "@/shared/components/ui/Text";
import { useProfileStore } from "@/shared/stores/use-profile.store";
import { NavigationProp } from "@/shared/types/type";
import { useNavigation } from "@react-navigation/native";
import { useMemo } from "react";
import { TouchableOpacity } from "react-native";

const PHRASES = {
    morning: [
        "Time to lace up!",
        "A great run starts now.",
        "Make today's miles count.",
        "Your best run is ahead of you.",
        "Rise and run!",
    ],
    noon: [
        "Still time for a great run!",
        "Afternoon miles hit different.",
        "Push through — you've got this.",
        "Mid-day energy? Use it.",
        "Your legs are ready. Are you?",
    ],
    evening: [
        "End the day strong.",
        "One more run before you rest.",
        "Evening miles are earned miles.",
        "Finish the day on your feet.",
        "The night run is calling.",
    ],
};
const GREETING_ICONS = {
    morning: "sunny-outline",
    noon: "partly-sunny-outline",
    evening: "moon-outline",
};
export default function HomeHeader() {
    const navigation = useNavigation<NavigationProp>();
    const profile = useProfileStore((s) => s.profile);

    const hour = new Date().getHours();
    const greeting = hour < 12 ? "morning" : hour < 17 ? "noon" : "evening";

    const randomPhrase = useMemo(() => {
        const pool = PHRASES[greeting];
        return pool[Math.floor(Math.random() * pool.length)];
    }, [greeting]);

    // const initials =
    //     profile?.name.trim().split(" ")[0].split("")[0].toUpperCase() ?? "?";
    return (
        <RowView className="p-4 pb-0">
            <ColView className="flex-1 gap-1">
                <RowView className="justify-between items-start">
                    <ColView className="gap-0">
                        <RowView className="gap-1.5 items-center">
                            <Text className="text-lg text-muted-foreground capitalize">
                                Good {greeting}
                            </Text>
                            <Icon
                                name={GREETING_ICONS[greeting]}
                                size={16}
                                className="text-muted-foreground"
                            />
                        </RowView>
                        <Text className="capitalize text-2xl font-medium">
                            {profile?.name} !
                        </Text>
                    </ColView>
                    <RowView>
                        <TouchableOpacity
                            onPress={() => navigation.navigate("Schedule")}
                        >
                            <Card className="p-0 bg-transparent justify-center items-center">
                                <Icon
                                    name="calendar-outline"
                                    size={24}
                                    className="text-foreground"
                                />
                            </Card>
                        </TouchableOpacity>
                    </RowView>
                </RowView>
                <Text className="text-2xl text-primary">{randomPhrase}</Text>
            </ColView>
        </RowView>
    );
}
