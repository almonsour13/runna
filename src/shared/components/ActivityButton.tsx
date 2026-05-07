import { cn } from "@/shared/utils/cn";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import { TouchableOpacity, View } from "react-native";
import Card from "./ui/Card";

export default function ActivityButton() {
    const navigation = useNavigation();
    return (
        <TouchableOpacity activeOpacity={0.9}>
            <Card
                className={cn(
                    "relative bg-primary h-16 aspect-square justify-center items-center ",
                )}
            >
                <View className="absolute justify-between items-center">
                    <Ionicons
                        name="footsteps"
                        size={24}
                        className="text-white"
                    />
                </View>
            </Card>
        </TouchableOpacity>
    );
}
