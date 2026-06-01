import { ColView, RowView } from "@/shared/components/CustomView";
import Card from "@/shared/components/ui/Card";
import { DrawerHandle } from "@/shared/components/ui/Drawer";
import Icon from "@/shared/components/ui/Icon";
import Text from "@/shared/components/ui/Text";
import { profileService } from "@/shared/services/storage/profile.service";
import { useProfileStore } from "@/shared/stores/use-profile.store";
import { Profile } from "@/shared/types/type";
import { cn } from "@/shared/utils/cn";
import { formatCmToftIn } from "@/shared/utils/format";
import { useNavigation } from "@react-navigation/native";
import { useRef, useState } from "react";
import { TextInput, TouchableOpacity } from "react-native";
import AgeDrawer from "../../shared/components/drawer/AgeDrawer";
import GenderDrawer from "../../shared/components/drawer/GenderDrawer";
import GoalDrawer from "../../shared/components/drawer/GoalDrawer";
import HeightDrawer from "../../shared/components/drawer/HeightDrawer";
import WeightDrawer from "../../shared/components/drawer/WeightDrawer";

export default function ProfileEditScreen() {
    const navigation = useNavigation();
    const [isUpdating, setIsUpdating] = useState(false);
    const profile = useProfileStore((s) => s.profile);
    const updateProfile = useProfileStore((s) => s.updateProfile);

    const [newProfile, setNewProfile] = useState<Profile | null>(
        profile || {
            name: "",
            age: 0,
            gender: null,
            height: 0,
            weight: 0,
            goal: 0,
        },
    );

    const ageDrawerRef = useRef<DrawerHandle>(null);
    const genderDrawerRef = useRef<DrawerHandle>(null);
    const heightDrawerRef = useRef<DrawerHandle>(null);
    const weightDrawerRef = useRef<DrawerHandle>(null);
    const goalDrawerRef = useRef<DrawerHandle>(null);

    const handleChange = (key: keyof Profile, value: any) => {
        setNewProfile((prev) => {
            if (!prev) return null;

            return {
                ...prev,
                [key]: value,
            };
        });
    };

    const handleSave = async () => {
        if (newProfile) {
            const updated = {
                ...newProfile,
                updatedAt: Date.now().toString(),
            };
            setIsUpdating(true);
            profileService
                .update(updated)
                .then(() => {
                    updateProfile(updated);
                    navigation.goBack();
                })
                .catch(() => {
                    setIsUpdating(false);
                });
        }
    };

    const isDirty =
        newProfile?.name?.trim() !== profile?.name?.trim() ||
        newProfile?.age !== profile?.age ||
        newProfile?.gender !== profile?.gender ||
        newProfile?.weight !== profile?.weight ||
        newProfile?.height !== profile?.height;

    const isValid =
        !!newProfile?.name?.trim() &&
        !!newProfile?.age &&
        !!newProfile?.gender &&
        !!newProfile?.weight &&
        !!newProfile?.height;

    const canSave = isDirty && isValid;

    return (
        <>
            <ColView className="flex-1 gap-8">
                <RowView className="p-4 justify-between items-center">
                    <RowView className="gap-4 items-center">
                        <TouchableOpacity onPress={() => navigation.goBack()}>
                            <Icon
                                name="arrow-back"
                                size={24}
                                className="text-foreground"
                            />
                        </TouchableOpacity>
                        <Text className="text-2xl">Edit Profile</Text>
                    </RowView>
                </RowView>

                <ColView className="px-4 gap-4">
                    <ColView>
                        <Text>Name</Text>
                        <Card className="h-16 py-2">
                            <TextInput
                                placeholder="Enter your name"
                                value={newProfile?.name}
                                onChangeText={(v) => handleChange("name", v)}
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
                                        {newProfile?.age
                                            ? newProfile.age
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
                                    <Text className="capitalize">
                                        {newProfile?.gender
                                            ? newProfile.gender
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
                                        {newProfile?.height
                                            ? formatCmToftIn(newProfile.height)
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
                                        {newProfile?.weight
                                            ? `${newProfile.weight} kg`
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
                                    {newProfile?.goal
                                        ? `${newProfile.goal / 1000} km`
                                        : "Select Goal"}
                                </Text>
                            </Card>
                        </TouchableOpacity>
                    </ColView>
                </ColView>

                <ColView className="flex-1 justify-end p-4 pb-8">
                    <TouchableOpacity
                        className={cn(
                            "h-16 rounded-full bg-primary justify-center items-center",
                            (!canSave || isUpdating) && "opacity-30",
                        )}
                        disabled={!canSave || isUpdating}
                        onPress={() => handleSave()}
                    >
                        <Text className="text-white">
                            {isUpdating ? "Updating..." : "Save"}
                        </Text>
                    </TouchableOpacity>
                </ColView>
            </ColView>

            <AgeDrawer
                ref={ageDrawerRef}
                value={newProfile?.age}
                onChange={(v) => handleChange("age", v)}
            />
            <GenderDrawer
                ref={genderDrawerRef}
                value={newProfile?.gender}
                onChange={(v) => handleChange("gender", v)}
            />
            <HeightDrawer
                ref={heightDrawerRef}
                value={newProfile?.height}
                onChange={(v) => handleChange("height", v)}
            />
            <WeightDrawer
                ref={weightDrawerRef}
                value={newProfile?.weight}
                onChange={(v) => handleChange("weight", v)}
            />
            <GoalDrawer
                ref={goalDrawerRef}
                value={newProfile?.goal}
                onChange={(v) => handleChange("goal", v)}
            />
        </>
    );
}
