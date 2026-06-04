import { ColView, RowView } from "@/shared/components/CustomView";
import Text from "@/shared/components/ui/Text";
import { useOnboardingContext } from "@/shared/context/OnboardingContext";
import { onboardingService } from "@/shared/services/storage/oboarding.service";
import { profileService } from "@/shared/services/storage/profile.service";
import { useProfileStore } from "@/shared/stores/use-profile.store";
import { NavigationProp, Profile } from "@/shared/types/type";
import { cn } from "@/shared/utils/cn";
import { useNavigation } from "@react-navigation/native";
import { useEffect, useRef, useState } from "react";
import {
    Animated,
    Dimensions,
    FlatList,
    TouchableOpacity,
    View,
} from "react-native";
import FinishSteps from "../components/FinishSteps";
import PermissionSteps from "../components/PermissionSteps";
import ProfileSteps from "../components/ProfileSteps";

const { width } = Dimensions.get("window");
const ONBOARDING_STEPS = ["Profile", "Permission", "Finish"];

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
        goal: 5000,
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
    const isLastStep = index === ONBOARDING_STEPS.length - 1;
    const step = ONBOARDING_STEPS[index];

    const nextStep = () => {
        if (index < ONBOARDING_STEPS.length - 1) {
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
                    setIsFinishing(false);
                }, 300);
            })
            .catch((e) => {
                console.error("Failed to save profile", e);
            });
    };
    return (
        <ColView className="flex-1 gap-8">
            <RowView className="pt-12 px-4 gap-1.5">
                {(() => {
                    const animatedVals = useRef<Animated.Value[] | null>(null);
                    if (!animatedVals.current) {
                        animatedVals.current = ONBOARDING_STEPS.map(
                            (_, i) => new Animated.Value(i <= index ? 1 : 0),
                        );
                    }

                    useEffect(() => {
                        const anims = (animatedVals.current || []).map(
                            (av, i) =>
                                Animated.timing(av, {
                                    toValue: i <= index ? 1 : 0,
                                    duration: 300,
                                    useNativeDriver: false,
                                }),
                        );
                        Animated.parallel(anims).start();
                    }, [index]);

                    return ONBOARDING_STEPS.map((s, i) => {
                        const av = (animatedVals.current || [])[i];
                        const width = av
                            ? av.interpolate({
                                  inputRange: [0, 1],
                                  outputRange: ["0%", "100%"],
                              })
                            : "100%";

                        return (
                            <View
                                key={s}
                                className="flex-1 h-1 rounded-full bg-muted"
                            >
                                <Animated.View
                                    className="h-1 rounded-full bg-primary"
                                    style={{ width }}
                                />
                            </View>
                        );
                    });
                })()}
            </RowView>

            <View className="flex-1">
                <FlatList
                    ref={flatListRef}
                    data={ONBOARDING_STEPS}
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
                                        step={step}
                                        profile={profile}
                                        setProfile={setProfile}
                                    />
                                );
                            case "Permission":
                                return (
                                    <PermissionSteps
                                        step={step}
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
                        (!canProceedToNextStep || isFinishing) && "opacity-50",
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
