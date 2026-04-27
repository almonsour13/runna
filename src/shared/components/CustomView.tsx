import { View, ViewProps } from "react-native";
import { cn } from "../utils/cn";
interface Props extends ViewProps {
    className?: string;
    children?: React.ReactNode;
}
export function RowView({ className, children, ...props }: Props) {
    return (
        <View className={cn("flex-row gap-2", className)} {...props}>
            {children}
        </View>
    );
}
export function ColView({ className, children, ...props }: Props) {
    return (
        <View className={cn("flex-col gap-2", className)} {...props}>
            {children}
        </View>
    );
}
