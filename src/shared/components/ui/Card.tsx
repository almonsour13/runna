import clsx from "clsx";
import { View, ViewProps } from "react-native";

interface Props extends ViewProps {
    className?: string;
    children?: React.ReactNode;
}
export default function Card({ className, children, ...props }: Props) {
    return (
        <View
            className={clsx(
                "bg-card border border-border rounded-2xl",
                className,
            )}
            {...props}
        >
            {children}
        </View>
    );
}
