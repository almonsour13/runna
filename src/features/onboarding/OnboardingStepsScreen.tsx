import { ColView, RowView } from "@/shared/components/CustomView";
import Text from "@/shared/components/ui/Text";
import { useOnboardingContext } from "@/shared/context/OnboardingContext";
import { onboardingService } from "@/shared/services/storage/oboarding.service";
import { profileService } from "@/shared/services/storage/profile.service";
import { useProfileStore } from "@/shared/stores/use-profile.store";
import { NavigationProp, Profile } from "@/shared/types/type";
import { cn } from "@/shared/utils/cn";
import { useNavigation } from "@react-navigation/native";
import { useRef, useState } from "react";
import { Dimensions, FlatList, TouchableOpacity, View } from "react-native";
import FinishSteps from "./components/FinishSteps";
import PermissionSteps from "./components/PermissionSteps";
import ProfileSteps from "./components/ProfileSteps";

const { width } = Dimensions.get("window");
const STEPS = ["Profile", "Permission", "Finish"];

type PermissionStatus = "idle" | "granted" | "denied";
export type Permissions = {
    location: PermissionStatus;
    notifications: PermissionStatus;
    photos: PermissionStatus;
    sensor: PermissionStatus;
};
export default function OnboardingStepsScreen() {
    const navigation = useNavigation<NavigationProp>();
    const { setIsOnboarded } = useOnboardingContext();
    const [index, setIndex] = useState(0);
    const [isFinishing, setIsFinishing] = useState(false);
    const [profile, setProfile] = useState<Profile>({
        name: "asdasdasdas",
        age: 25,
        weight: 65,
        height: 165,
        gender: "male",
        goal: 0,
    });
    const [permissions, setPermissions] = useState<Permissions>({
        location: "idle",
        notifications: "idle",
        photos: "idle",
        sensor: "idle",
    });

    const setNewProfile = useProfileStore((s) => s.setProfile);

    const flatListRef = useRef<FlatList>(null);
    const isFirstStep = index === 0;
    const isLastStep = index === STEPS.length - 1;

    const nextStep = () => {
        if (index < STEPS.length - 1) {
            flatListRef.current?.scrollToIndex({ index: index + 1 });
        }
    };
    const prevStep = () => {
        if (index > 0) {
            flatListRef.current?.scrollToIndex({ index: index - 1 });
        }
    };

    const isProfileValid =
        profile.name !== "" &&
        profile.age > 0 &&
        profile.weight > 0 &&
        profile.height > 0 &&
        profile.gender !== null &&
        profile.goal > 0;

    const arePermissionsGranted = Object.values(permissions).every(
        (status) => status === "granted",
    );

    const canProceedToNextStep =
        (index === 0 && isProfileValid) ||
        (index === 1 && arePermissionsGranted) ||
        index === 2;

    const finish = async () => {
        if (!canProceedToNextStep) return;
        setIsFinishing(true);
        await profileService
            .save(profile)
            .then(() => {
                setNewProfile(profile);
                onboardingService.completeOnboarding().then(() => {
                    setIsOnboarded(true);
                });
                setTimeout(() => {
                    navigation.navigate("Main");
                }, 1000);
            })
            .catch((e) => {
                console.error("Failed to save profile", e);
            })
            .finally(() => {
                setIsFinishing(false);
            });
    };
    return (
        <ColView className="flex-1 gap-8">
            <RowView className="pt-12 px-4 gap-1.5">
                {STEPS.map((s, i) => (
                    <View
                        key={s}
                        className={cn(
                            "flex-1 h-1 rounded-full",
                            i <= index ? "bg-primary" : "bg-muted",
                        )}
                    />
                ))}
            </RowView>

            <View className="flex-1">
                <FlatList
                    ref={flatListRef}
                    data={STEPS}
                    keyExtractor={(item) => item}
                    horizontal
                    pagingEnabled
                    scrollEnabled={false}
                    showsHorizontalScrollIndicator={false}
                    onMomentumScrollEnd={(e) => {
                        const i = Math.round(
                            e.nativeEvent.contentOffset.x / width,
                        );
                        setIndex(i);
                    }}
                    renderItem={({ item }) => {
                        switch (item) {
                            case "Profile":
                                return (
                                    <ProfileSteps
                                        profile={profile}
                                        setProfile={setProfile}
                                    />
                                );
                            case "Permission":
                                return (
                                    <PermissionSteps
                                        permissions={permissions}
                                        setPermissions={setPermissions}
                                    />
                                );
                            case "Finish":
                                return <FinishSteps />;
                            default:
                                return null;
                        }
                    }}
                />
            </View>

            <RowView className="px-4 pb-12 gap-4">
                {!isFirstStep ? (
                    <TouchableOpacity
                        onPress={prevStep}
                        className="h-16 flex-1 rounded-full justify-center items-center bg-muted"
                    >
                        <Text className="text-foreground font-medium">
                            Back
                        </Text>
                    </TouchableOpacity>
                ) : (
                    <View className="flex-1" />
                )}
                <TouchableOpacity
                    onPress={isLastStep ? finish : nextStep}
                    disabled={!canProceedToNextStep}
                    className={cn(
                        "h-16 flex-1 rounded-full justify-center items-center bg-primary",
                        !canProceedToNextStep && "opacity-50",
                    )}
                >
                    <Text className="text-white font-medium">
                        {isFinishing
                            ? "Finishing..."
                            : isLastStep
                              ? "Finish"
                              : "Next"}
                    </Text>
                </TouchableOpacity>
            </RowView>
        </ColView>
    );
}
