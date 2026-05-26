import { View } from "react-native";
import { cn } from "../utils/cn";

export default function Divider({
    className,
    direction = "horizontal",
}: {
    className?: string;
    direction?: "horizontal" | "vertical";
}) {
    const isHorizontal = direction === "horizontal";
    return (
        <View
            className={cn(
                "bg-border",
                isHorizontal ? "h-px w-full" : "w-px h-full",
                className,
            )}
        />
    );
}
