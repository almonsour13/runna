import Card from "@/shared/components/ui/Card";
import { cn } from "@/shared/utils/cn";
import { Ionicons } from "@expo/vector-icons";
import { TouchableOpacity } from "react-native";

export default function AddScheduleButton() {
    return (
        <TouchableOpacity className="absolute bottom-4 right-4">
            <Card
                className={cn(
                    "relative bg-primary h-16 aspect-square justify-center items-center ",
                )}
            >
                <Ionicons name="add" size={24} className="text-white" />
            </Card>
        </TouchableOpacity>
    );
}
