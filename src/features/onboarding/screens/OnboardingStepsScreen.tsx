import { ColView, RowView } from "@/shared/components/CustomView";
import Card from "@/shared/components/ui/Card";
import Text from "@/shared/components/ui/Text";
import { useOnboardingContext } from "@/shared/context/OnboardingContext";
import { onboardingService } from "@/shared/services/storage/oboarding.service";
import { profileService } from "@/shared/services/storage/profile.service";
import { settingsService } from "@/shared/services/storage/settings.service";
import { useProfileStore } from "@/shared/stores/use-profile.store";
import { useSettingsStore } from "@/shared/stores/use-settings-store";
import { NavigationProp, Preferences, Profile } from "@/shared/types/type";
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
import FinishStep from "../components/FinishStep";
import PermissionStep from "../components/PermissionStep";
import PreferencesStep from "../components/PreferencesStep";
import ProfileStep from "../components/ProfileStep";

const { width } = Dimensions.get("window");
const ONBOARDING_STEPS = ["Profile", "Preferences", "Permission", "Finish"];

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
        name: "",
        age: 0,
        weight: 0,
        height: 165,
        gender: null,
    });
    const [preferences, setPreferences] = useState<Preferences>({
        theme: "system",
        unit: "kilometers",
        goal: 0,
        mapStyle: "Streets",
    });
    const [permissions, setPermissions] = useState<Permissions>({
        location: "idle",
        notifications: "idle",
        photos: "idle",
        sensor: "idle",
    });

    const setNewProfile = useProfileStore((s) => s.setProfile);
    const setSettings = useSettingsStore((s) => s.setSettings);
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
        profile.gender !== null;

    const isPreferencesValid = preferences.goal > 0;

    const arePermissionsGranted = Object.values(permissions).every(
        (status) => status === "granted",
    );

    const canProceedToNextStep =
        (index === 0 && isProfileValid) ||
        (index === 1 && isPreferencesValid) ||
        (index === 2 && arePermissionsGranted) ||
        index === 3;

    const finish = async () => {
        if (!canProceedToNextStep || isFinishing) return;
        setIsFinishing(true);
        try {
            await profileService.save(profile);
            await settingsService.save({ preferences });
            await onboardingService.completeOnboarding();

            setNewProfile(profile);
            setSettings({ preferences });
            setIsOnboarded(true);
            setTimeout(() => {
                navigation.navigate("Home");
            }, 200);
        } catch (e) {
            console.error("[Onboarding] Failed to finish:", e);
        } finally {
            setIsFinishing(false);
        }
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
                                    <ProfileStep
                                        step={step}
                                        profile={profile}
                                        setProfile={setProfile}
                                    />
                                );
                            case "Preferences":
                                return (
                                    <PreferencesStep
                                        preferences={preferences}
                                        setPreferences={setPreferences}
                                        step={step}
                                    />
                                );
                            case "Permission":
                                return (
                                    <PermissionStep
                                        step={step}
                                        permissions={permissions}
                                        setPermissions={setPermissions}
                                    />
                                );
                            case "Finish":
                                return <FinishStep />;
                            default:
                                return null;
                        }
                    }}
                />
            </View>

            <RowView className="px-4 pb-12">
                {!isFirstStep ? (
                    <TouchableOpacity onPress={prevStep} className="flex-1">
                        <Card className="h-16 justify-center items-center bg-muted ">
                            <Text className="text-foreground text-lg  font-medium">
                                Back
                            </Text>
                        </Card>
                    </TouchableOpacity>
                ) : (
                    <View className="flex-1" />
                )}
                <TouchableOpacity
                    onPress={isLastStep ? finish : nextStep}
                    disabled={!canProceedToNextStep}
                    className={cn(
                        "flex-1",
                        (!canProceedToNextStep || isFinishing) && "opacity-50",
                    )}
                >
                    <Card className="h-16 justify-center items-center bg-primary ">
                        <Text className="text-white text-lg font-medium">
                            {isFinishing
                                ? "Finishing..."
                                : isLastStep
                                  ? "Finish"
                                  : "Next"}
                        </Text>
                    </Card>
                </TouchableOpacity>
            </RowView>
        </ColView>
    );
}
