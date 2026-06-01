import "@/global.css";
import RootNavigator from "@/navigation/RootNavigator";
import OnboardingProvider from "@/shared/context/OnboardingContext";
import ThemeProvider from "@/shared/providers/ThemeProvider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

ErrorUtils.setGlobalHandler((error, isFatal) => {
    console.log("GLOBAL ERROR:", error.message);
    console.log("IS FATAL:", isFatal);
    console.log("STACK:", error.stack);
});

const queryClient = new QueryClient();

export default function App() {
    return (
        <GestureHandlerRootView>
            <OnboardingProvider>
                <SafeAreaProvider>
                    <QueryClientProvider client={queryClient}>
                        <ThemeProvider>
                            <RootNavigator />
                        </ThemeProvider>
                    </QueryClientProvider>
                </SafeAreaProvider>
            </OnboardingProvider>
        </GestureHandlerRootView>
    );
}
