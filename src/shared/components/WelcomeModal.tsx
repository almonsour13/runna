import { ColView } from "@/shared/components/CustomView";
import Icon from "@/shared/components/ui/Icon";
import Text from "@/shared/components/ui/Text";
import { useEffect, useState } from "react";
import { Dimensions, Modal, TouchableOpacity, View } from "react-native";

const { width } = Dimensions.get("window");

export default function WelcomeModal() {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        // small delay so the screen renders first
        const timer = setTimeout(() => setVisible(true), 500);
        return () => clearTimeout(timer);
    }, []);

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            statusBarTranslucent
        >
            {/* Backdrop */}
            <View className="flex-1 bg-black/60 justify-end">
                {/* Sheet */}
                <ColView className="bg-background rounded-t-3xl px-6 pt-6 pb-12 gap-6">
                    {/* Handle */}
                    <View className="w-10 h-1 bg-muted rounded-full self-center" />

                    {/* Icon */}
                    <View className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 items-center justify-center self-center">
                        <Icon
                            name="trophy"
                            size={32}
                            className="text-primary"
                        />
                    </View>

                    {/* Text */}
                    <ColView className="items-center gap-2">
                        <Text className="text-2xl font-bold text-center">
                            Welcome to Runna! 🎉
                        </Text>
                        <Text className="text-sm text-muted-foreground text-center leading-relaxed">
                            You're all set. Lace up, hit start, and track your
                            first run today.
                        </Text>
                    </ColView>

                    {/* CTA */}
                    <TouchableOpacity
                        className="h-14 rounded-full bg-primary items-center justify-center"
                        onPress={() => setVisible(false)}
                    >
                        <Text className="text-white font-semibold text-base">
                            Let's Go 🏃
                        </Text>
                    </TouchableOpacity>
                </ColView>
            </View>
        </Modal>
    );
}
