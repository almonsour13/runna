import "@/global.css";
import RootNavigator from "@/navigation/RootNavigator";
import ThemeProvider from "@/shared/providers/ThemeProvider";
import "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function App() {
    return (
        <SafeAreaProvider>
            <ThemeProvider>
                <RootNavigator />
            </ThemeProvider>
        </SafeAreaProvider>
    );
}
