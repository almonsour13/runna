import { cn } from "@/shared/utils/cn";
import { View, ViewProps } from "react-native";

interface Props extends ViewProps {
    className?: string;
    children?: React.ReactNode;
}
export default function Card({ className, children, ...props }: Props) {
    return (
        <View className={cn("p-4 bg-card rounded-xl", className)} {...props}>
            {children}
        </View>
    );
}
