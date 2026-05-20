import { ColView, RowView } from "@/shared/components/CustomView";
import Text from "@/shared/components/ui/Text";
import { useProfileStore } from "@/shared/stores/use-profile.store";
import { useMemo } from "react";

const PHRASES = {
    morning: [
        "Time to lace up! 👟",
        "A great run starts now.",
        "Make today's miles count.",
        "Your best run is ahead of you.",
        "Rise and run! 🌅",
    ],
    noon: [
        "Still time for a great run!",
        "Afternoon miles hit different. 🔥",
        "Push through — you've got this.",
        "Mid-day energy? Use it.",
        "Your legs are ready. Are you?",
    ],
    evening: [
        "End the day strong. 💪",
        "One more run before you rest.",
        "Evening miles are earned miles.",
        "Finish the day on your feet.",
        "The night run is calling. 🌙",
    ],
};

export default function HomeHeader() {
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
        <RowView className="px-4 pt-8 gap-4 justify-between items-start">
            <ColView className="flex-1 gap-0">
                <Text className="text-2xl text-foreground">
                    Good {greeting}, {profile?.name}
                </Text>
                <Text className="text-lg text-muted-foreground">
                    {randomPhrase}
                </Text>
            </ColView>
        </RowView>
    );
}
