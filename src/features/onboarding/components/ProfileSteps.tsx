import { ColView, RowView } from "@/shared/components/CustomView";
import AgeDrawer from "@/shared/components/drawer/AgeDrawer";
import GenderDrawer from "@/shared/components/drawer/GenderDrawer";
import GoalDrawer from "@/shared/components/drawer/GoalDrawer";
import HeightDrawer from "@/shared/components/drawer/HeightDrawer";
import WeightDrawer from "@/shared/components/drawer/WeightDrawer";
import Card from "@/shared/components/ui/Card";
import { DrawerHandle } from "@/shared/components/ui/Drawer";
import Text from "@/shared/components/ui/Text";
import { Profile } from "@/shared/types/type";
import { formatCmToftIn } from "@/shared/utils/format";
import { capitalize } from "@/shared/utils/utils";
import { useRef } from "react";
import { Dimensions, TextInput, TouchableOpacity } from "react-native";

const { width } = Dimensions.get("window");
export default function ProfileSteps({
    profile,
    setProfile,
}: {
    profile: Profile;
    setProfile: React.Dispatch<React.SetStateAction<Profile>>;
}) {
    const ageDrawerRef = useRef<DrawerHandle>(null);
    const genderDrawerRef = useRef<DrawerHandle>(null);
    const heightDrawerRef = useRef<DrawerHandle>(null);
    const weightDrawerRef = useRef<DrawerHandle>(null);
    const goalDrawerRef = useRef<DrawerHandle>(null);

    const handleChange = (key: keyof Profile, value: any) => {
        console.log(key, value);
        setProfile((prev) => {
            return {
                ...prev,
                [key]: value,
            };
        });
    };

    return (
        <>
            <ColView className="flex-1 gap-4" style={{ width }}>
                <ColView className="px-4 justify-center gap-4">
                    <Text className="text-4xl font-semibold">
                        Tell us about{"\n"}yourself
                    </Text>
                    <Text className="text-base text-muted-foreground leading-relaxed">
                        We'll use this to calculate your calories and distance,
                    </Text>
                </ColView>
                <ColView className="px-4 gap-4">
                    <ColView>
                        <Text>Name</Text>
                        <Card className="h-16 py-2">
                            <TextInput
                                placeholder="Enter your name"
                                value={profile?.name}
                                onChangeText={(v) =>
                                    setProfile({ ...profile, name: v })
                                }
                            />
                        </Card>
                    </ColView>

                    <RowView>
                        <ColView className="flex-1">
                            <Text>Age</Text>
                            <TouchableOpacity
                                onPress={() => ageDrawerRef.current?.open()}
                            >
                                <Card className="h-16 justify-center">
                                    <Text>
                                        {profile?.age
                                            ? profile.age
                                            : "Select Age"}
                                    </Text>
                                </Card>
                            </TouchableOpacity>
                        </ColView>
                        <ColView className="flex-1">
                            <Text>Gender</Text>
                            <TouchableOpacity
                                onPress={() => genderDrawerRef.current?.open()}
                            >
                                <Card className="h-16 justify-center">
                                    <Text>
                                        {profile?.gender
                                            ? capitalize(profile.gender)
                                            : "Select Gender"}
                                    </Text>
                                </Card>
                            </TouchableOpacity>
                        </ColView>
                    </RowView>

                    <RowView>
                        <ColView className="flex-1">
                            <Text>Height</Text>
                            <TouchableOpacity
                                onPress={() => heightDrawerRef.current?.open()}
                            >
                                <Card className="h-16 justify-center">
                                    <Text>
                                        {profile?.height
                                            ? formatCmToftIn(profile.height)
                                            : "Select Height"}
                                    </Text>
                                </Card>
                            </TouchableOpacity>
                        </ColView>
                        <ColView className="flex-1">
                            <Text>Weight</Text>
                            <TouchableOpacity
                                onPress={() => weightDrawerRef.current?.open()}
                            >
                                <Card className="h-16 justify-center">
                                    <Text>
                                        {profile?.weight
                                            ? `${profile.weight} kg`
                                            : "Select Weight"}
                                    </Text>
                                </Card>
                            </TouchableOpacity>
                        </ColView>
                    </RowView>

                    <ColView>
                        <Text>Goal</Text>
                        <TouchableOpacity
                            onPress={() => goalDrawerRef.current?.open()}
                        >
                            <Card className="h-16 justify-center">
                                <Text>
                                    {profile?.goal
                                        ? `${profile.goal / 1000} km`
                                        : "Select Goal"}
                                </Text>
                            </Card>
                        </TouchableOpacity>
                    </ColView>
                </ColView>
            </ColView>

            <AgeDrawer
                ref={ageDrawerRef}
                value={profile?.age}
                onChange={(v) => handleChange("age", v)}
            />
            <GenderDrawer
                ref={genderDrawerRef}
                value={profile?.gender}
                onChange={(v) => handleChange("gender", v)}
            />
            <HeightDrawer
                ref={heightDrawerRef}
                value={profile?.height}
                onChange={(v) => handleChange("height", v)}
            />
            <WeightDrawer
                ref={weightDrawerRef}
                value={profile?.weight}
                onChange={(v) => handleChange("weight", v)}
            />
            <GoalDrawer
                ref={goalDrawerRef}
                value={profile?.goal}
                onChange={(v) => handleChange("goal", v)}
            />
        </>
    );
}
