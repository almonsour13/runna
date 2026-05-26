import Card from "@/shared/components/ui/Card";
import Text from "@/shared/components/ui/Text";
import { cn } from "@/shared/utils/cn";
import { TouchableOpacity } from "react-native";

export default function FilterButton({
    className,
    label,
    active,
    onPress,
    ...props
}: {
    className?: string;
    label?: string;
    active: boolean;
    onPress: () => void;
}) {
    return (
        <TouchableOpacity onPress={onPress} {...props} className={className}>
            <Card className={cn("py-2 px-3", active && "bg-primary")}>
                <Text
                    className={cn(
                        "text-sm",
                        active ? "text-white" : "text-foreground",
                    )}
                >
                    {label}
                </Text>
            </Card>
        </TouchableOpacity>
    );
}
