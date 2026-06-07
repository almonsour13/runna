import { ColView } from "@/shared/components/CustomView";
import Drawer, { DrawerHandle } from "@/shared/components/ui/Drawer";
import { STORAGE_KEYS } from "@/shared/constant/constant";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { useEffect, useRef } from "react";
import { Image, TouchableOpacity } from "react-native";
import Card from "../ui/Card";
import Text from "../ui/Text";

const config = Constants.expoConfig;
const AppName = config?.name;

export default function WelcomeDrawer() {
    const drawerRef = useRef<DrawerHandle>(null);

    useEffect(() => {
        const checkWelcomeStatus = async () => {
            const seen = await AsyncStorage.getItem(STORAGE_KEYS.welcome);
            if (!seen) {
                setTimeout(() => {
                    drawerRef.current?.open();
                }, 500);
            }
        };
        checkWelcomeStatus();
    }, []);

    const handleClose = async () => {
        await AsyncStorage.setItem(STORAGE_KEYS.welcome, "true");
    };

    return (
        <Drawer ref={drawerRef} onClose={handleClose}>
            <ColView className="gap-8 p-4">
                <ColView className="justify-center items-center p-0">
                    <Image
                        source={require("../../../../assets/images/splash-icon.png")}
                        style={{ width: 120, height: 120 }}
                        resizeMode="contain"
                    />
                </ColView>
                <ColView className="items-center gap-2">
                    <Text className="text-4xl font-medium text-center">
                        Welcome to {AppName}!
                    </Text>
                    <Text className="text-base text-muted-foreground text-center leading-relaxed">
                        You're all set. Lace up, hit start, and track your first
                        run today.
                    </Text>
                </ColView>
                <TouchableOpacity
                    onPress={() => {
                        handleClose();
                        drawerRef.current?.close();
                    }}
                    activeOpacity={0.8}
                >
                    <Card className="h-16 justify-center items-center bg-primary">
                        <Text className="text-white text-lg font-medium">
                            Let's Go
                        </Text>
                    </Card>
                </TouchableOpacity>
            </ColView>
        </Drawer>
    );
}
