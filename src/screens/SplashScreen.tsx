import { Image, View } from "react-native";

export default function SplashScreen() {
    return (
        <View className="flex-1 items-center justify-center bg-background">
            <Image
                source={require("../../assets/images/splash-icon.png")}
                style={{ width: 120, height: 120 }}
                resizeMode="contain"
            />
        </View>
    );
}
