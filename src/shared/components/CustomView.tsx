import { clsx } from "clsx";
import { View, ViewProps } from "react-native";
interface Props extends ViewProps {
    className?: string;
    children?: React.ReactNode;
}
export function RowView({ className, children, ...props }: Props) {
    return (
        <View className={clsx("flex-row", className)} {...props}>
            {children}
        </View>
    );
}
export function ColView({ className, children, ...props }: Props) {
    return (
        <View className={clsx("flex-col", className)} {...props}>
            {children}
        </View>
    );
}
