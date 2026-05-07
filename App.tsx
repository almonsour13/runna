import "@/global.css";
import RootNavigator from "@/navigation/RootNavigator";
import ThemeProvider from "@/shared/providers/ThemeProvider";
import "react-native-gesture-handler";

export default function App() {
    return (
        <ThemeProvider>
            <RootNavigator />
        </ThemeProvider>
    );
}
