import { cn } from "@/shared/utils/cn";
import { Text as RNText, TextProps } from "react-native";

export default function Text({ style, className, ...props }: TextProps) {
    const font = className?.includes("font-medium")
        ? "DMSans_500Medium"
        : className?.includes("font-semibold")
          ? "DMSans_600SemiBold"
          : className?.includes("font-bold")
            ? "DMSans_700Bold"
            : "DMSans_400Regular";
    return (
        <RNText
            style={[{ fontFamily: font }, style]}
            className={cn("", className)}
            {...props}
        />
    );
}
