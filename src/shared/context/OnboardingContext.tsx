import { onboardingService } from "@/shared/services/storage/oboarding.service";
import React, {
    createContext,
    Dispatch,
    SetStateAction,
    useContext,
    useEffect,
    useState,
} from "react";

type OnboardingContextType = {
    isOnboarded: boolean;
    loading: boolean;
    setIsOnboarded: Dispatch<SetStateAction<boolean>>;
    completeOnboarding: () => Promise<void>;
};

const OnboardingContext = createContext<OnboardingContextType | null>(null);

export const useOnboardingContext = () => {
    const ctx = useContext(OnboardingContext);
    if (!ctx) {
        throw new Error(
            "useOnboardingContext must be used within OnboardingProvider",
        );
    }
    return ctx;
};

export default function OnboardingProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const [isOnboarded, setIsOnboarded] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        onboardingService.isComplete().then((result) => {
            setIsOnboarded(result);
            setLoading(false);
        });
    }, []);

    const completeOnboarding = async () => {
        await onboardingService.completeOnboarding();
        setIsOnboarded(true);
    };

    return (
        <OnboardingContext.Provider
            value={{
                isOnboarded,
                loading,
                setIsOnboarded,
                completeOnboarding,
            }}
        >
            {children}
        </OnboardingContext.Provider>
    );
}
