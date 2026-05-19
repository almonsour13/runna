import "@/global.css";
import RootNavigator from "@/navigation/RootNavigator";
import ThemeProvider from "@/shared/providers/ThemeProvider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

const queryClient = new QueryClient();
export default function App() {
    return (
        <GestureHandlerRootView>
            <SafeAreaProvider>
                <QueryClientProvider client={queryClient}>
                    <ThemeProvider>
                        <RootNavigator />
                    </ThemeProvider>
                </QueryClientProvider>
            </SafeAreaProvider>
        </GestureHandlerRootView>
    );
}
