import { ColView } from "@/shared/components/CustomView";
import GoalDrawer from "@/shared/components/drawer/GoalDrawer";
import UnitDrawer from "@/shared/components/drawer/UnitDrawer";
import Card from "@/shared/components/ui/Card";
import { DrawerHandle } from "@/shared/components/ui/Drawer";
import Text from "@/shared/components/ui/Text";
import { Preferences } from "@/shared/types/type";
import { useEffect, useRef } from "react";
import { Dimensions, TouchableOpacity } from "react-native";

const { width } = Dimensions.get("window");
export default function PreferencesStep({
    preferences,
    setPreferences,
    step,
}: {
    preferences: Preferences;
    setPreferences: React.Dispatch<React.SetStateAction<Preferences>>;
    step: string;
}) {
    const goalDrawerRef = useRef<DrawerHandle>(null);
    const uniDrawerRef = useRef<DrawerHandle>(null);

    const handleChange = (key: keyof Preferences, value: any) => {
        console.log(key, value);
        setPreferences((prev) => {
            return {
                ...prev,
                [key]: value,
            };
        });
    };
    useEffect(() => {
        if (__DEV__) {
            setPreferences({
                ...preferences,
                goal: 5000,
            });
        }
    }, []);

    return (
        <>
            <ColView className="flex-1 gap-4" style={{ width }}>
                <ColView className="px-4 justify-center gap-4">
                    <Text className="text-3xl font-semibold text-foreground">
                        Customize your{"\n"}experience
                    </Text>
                    <Text className="text-sm text-muted-foreground leading-relaxed">
                        Set your daily goal and preferred units so everything
                        feels just right.
                    </Text>
                </ColView>
                <ColView className="px-4 gap-4">
                    <ColView>
                        <Text>Goal</Text>
                        <TouchableOpacity
                            onPress={() => goalDrawerRef.current?.open()}
                        >
                            <Card className="h-16 justify-center">
                                <Text>
                                    {preferences?.goal
                                        ? `${preferences.goal / 1000} km`
                                        : "Select Goal"}
                                </Text>
                            </Card>
                        </TouchableOpacity>
                    </ColView>

                    <ColView>
                        <Text>Unit</Text>
                        <TouchableOpacity
                            onPress={() => uniDrawerRef.current?.open()}
                        >
                            <Card className="h-16 justify-center">
                                <Text className="capitalize">
                                    {preferences?.unit
                                        ? `${preferences.unit}`
                                        : "Select Goal"}
                                </Text>
                            </Card>
                        </TouchableOpacity>
                    </ColView>
                </ColView>
            </ColView>
            <GoalDrawer
                ref={goalDrawerRef}
                value={preferences?.goal}
                onChange={(v) => handleChange("goal", v)}
            />
            <UnitDrawer
                ref={uniDrawerRef}
                value={preferences?.unit}
                onChange={(v) => handleChange("goal", v)}
            />
        </>
    );
}
