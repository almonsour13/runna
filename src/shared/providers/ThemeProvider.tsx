import { useColorScheme } from "nativewind";
import { View } from "react-native";
import { cn } from "../utils/cn";

export default function ThemeProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const { colorScheme } = useColorScheme();

    return (
        <View
            className={cn(
                "flex-1 bg-background",
                colorScheme === "dark" && "dark",
            )}
        >
            {children}
        </View>
    );
}
