import { STORAGE_KEYS } from "@/shared/constant/constant";
import { logger } from "@/shared/utils/logger";
import { StorageService } from "./storage.service";

class OnboardingService {
    private onboardingStore = new StorageService(STORAGE_KEYS.onboarding);

    async isComplete(): Promise<boolean> {
        logger.log("[OnboardingService] isComplete → checking");

        try {
            const status = await this.onboardingStore.get();
            const result = !!status;

            logger.log("[OnboardingService] isComplete → result:", result);

            return result;
        } catch (error) {
            logger.error("[OnboardingService] isComplete → error:", error);
            return false;
        }
    }

    async completeOnboarding(): Promise<void> {
        logger.log("[OnboardingService] completeOnboarding → start");

        try {
            await this.onboardingStore.set(true);
            logger.log("[OnboardingService] completeOnboarding → success");
        } catch (error) {
            logger.error(
                "[OnboardingService] completeOnboarding → error:",
                error,
            );
            throw error;
        }
    }

    async resetOnboarding(): Promise<void> {
        logger.warn("[OnboardingService] resetOnboarding → resetting");

        try {
            await this.onboardingStore.remove();
            logger.log("[OnboardingService] resetOnboarding → success");
        } catch (error) {
            logger.error("[OnboardingService] resetOnboarding → error:", error);
            throw error;
        }
    }
}

export const onboardingService = new OnboardingService();
