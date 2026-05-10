import "@/global.css";
import RootNavigator from "@/navigation/RootNavigator";
import ThemeProvider from "@/shared/providers/ThemeProvider";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function App() {
    return (
        <GestureHandlerRootView>
            <SafeAreaProvider>
                <ThemeProvider>
                    <RootNavigator />
                </ThemeProvider>
            </SafeAreaProvider>
        </GestureHandlerRootView>
    );
}
