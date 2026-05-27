import { Ionicons } from "@expo/vector-icons";
import { cn } from "../utils/cn";

interface Props extends React.SVGProps<SVGSVGElement> {
    name: keyof typeof Ionicons.glyphMap | any;
    size?: number;
    className?: string;
    color?: string;
    provider?: string;
}
export default function Icon({
    name,
    size = 12,
    className,
    color,
    provider = "Ionicons",
}: Props) {
    return (
        <Ionicons
            name={name}
            size={size}
            className={cn("text-primary", className)}
            color={color}
            provider={provider}
        />
    );
}
