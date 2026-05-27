import { ColView } from "@/shared/components/CustomView";
import Text from "@/shared/components/ui/Text";
import { NavigationProp } from "@/shared/types/type";
import { useNavigation } from "@react-navigation/native";
import { Dimensions, Image, TouchableOpacity, View } from "react-native";

import Constants from "expo-constants";
import Svg, {
    Defs,
    Ellipse,
    Line,
    LinearGradient,
    Path,
    Stop,
} from "react-native-svg";

const { width: SW, height: SH } = Dimensions.get("window");

function SportyBackground() {
    return (
        <Svg
            width={SW}
            height={SH}
            style={{ position: "absolute", top: 0, left: 0 }}
        >
            <Defs>
                <LinearGradient id="lg1" x1="0" y1="0" x2="1" y2="0">
                    <Stop offset="0" stopColor="#6366f1" stopOpacity="0" />
                    <Stop offset="0.5" stopColor="#6366f1" stopOpacity="0.15" />
                    <Stop offset="1" stopColor="#6366f1" stopOpacity="0" />
                </LinearGradient>
                <LinearGradient id="lg2" x1="0" y1="0" x2="1" y2="0">
                    <Stop offset="0" stopColor="#10b981" stopOpacity="0" />
                    <Stop offset="0.5" stopColor="#10b981" stopOpacity="0.12" />
                    <Stop offset="1" stopColor="#10b981" stopOpacity="0" />
                </LinearGradient>
                <LinearGradient id="lg3" x1="0" y1="0" x2="1" y2="0">
                    <Stop offset="0" stopColor="#f59e0b" stopOpacity="0" />
                    <Stop offset="0.5" stopColor="#f59e0b" stopOpacity="0.10" />
                    <Stop offset="1" stopColor="#f59e0b" stopOpacity="0" />
                </LinearGradient>
                <LinearGradient id="arc1" x1="0" y1="0" x2="0" y2="1">
                    <Stop offset="0" stopColor="#6366f1" stopOpacity="0.09" />
                    <Stop offset="1" stopColor="#6366f1" stopOpacity="0" />
                </LinearGradient>
                <LinearGradient id="arc2" x1="0" y1="0" x2="0" y2="1">
                    <Stop offset="0" stopColor="#10b981" stopOpacity="0.07" />
                    <Stop offset="1" stopColor="#10b981" stopOpacity="0" />
                </LinearGradient>
            </Defs>

            {/* Top speed lines */}
            <Line
                x1={-20}
                y1={SH * 0.17}
                x2={SW * 0.6}
                y2={SH * 0.11}
                stroke="url(#lg1)"
                strokeWidth={1.5}
            />
            <Line
                x1={-20}
                y1={SH * 0.2}
                x2={SW * 0.75}
                y2={SH * 0.14}
                stroke="url(#lg1)"
                strokeWidth={3}
            />
            <Line
                x1={-20}
                y1={SH * 0.23}
                x2={SW * 0.55}
                y2={SH * 0.18}
                stroke="url(#lg1)"
                strokeWidth={1}
            />
            <Line
                x1={-20}
                y1={SH * 0.26}
                x2={SW * 0.65}
                y2={SH * 0.22}
                stroke="url(#lg1)"
                strokeWidth={2}
            />

            {/* Mid speed lines */}
            <Line
                x1={SW * 0.2}
                y1={SH * 0.46}
                x2={SW + 20}
                y2={SH * 0.41}
                stroke="url(#lg2)"
                strokeWidth={2.5}
            />
            <Line
                x1={SW * 0.0}
                y1={SH * 0.49}
                x2={SW + 20}
                y2={SH * 0.45}
                stroke="url(#lg2)"
                strokeWidth={1.5}
            />
            <Line
                x1={SW * 0.3}
                y1={SH * 0.52}
                x2={SW + 20}
                y2={SH * 0.48}
                stroke="url(#lg2)"
                strokeWidth={0.8}
            />

            {/* Bottom speed lines */}
            <Line
                x1={-20}
                y1={SH * 0.76}
                x2={SW * 0.8}
                y2={SH * 0.71}
                stroke="url(#lg3)"
                strokeWidth={2}
            />
            <Line
                x1={-20}
                y1={SH * 0.79}
                x2={SW * 0.9}
                y2={SH * 0.75}
                stroke="url(#lg3)"
                strokeWidth={3.5}
            />
            <Line
                x1={-20}
                y1={SH * 0.82}
                x2={SW * 0.7}
                y2={SH * 0.79}
                stroke="url(#lg3)"
                strokeWidth={1}
            />

            {/* Track arcs */}
            <Ellipse
                cx={SW * 1.1}
                cy={SH * 0.24}
                rx={SW * 0.85}
                ry={SH * 0.22}
                stroke="url(#arc1)"
                strokeWidth={1.5}
                fill="none"
            />
            <Ellipse
                cx={SW * 1.1}
                cy={SH * 0.24}
                rx={SW * 0.72}
                ry={SH * 0.17}
                stroke="url(#arc1)"
                strokeWidth={0.8}
                fill="none"
            />
            <Ellipse
                cx={-SW * 0.1}
                cy={SH * 0.79}
                rx={SW * 0.8}
                ry={SH * 0.2}
                stroke="url(#arc2)"
                strokeWidth={1.5}
                fill="none"
            />
            <Ellipse
                cx={-SW * 0.1}
                cy={SH * 0.79}
                rx={SW * 0.66}
                ry={SH * 0.14}
                stroke="url(#arc2)"
                strokeWidth={0.8}
                fill="none"
            />

            {/* Corner wash — top right */}
            <Path
                d={`M ${SW} 0 Q ${SW * 0.55} ${SH * 0.09} ${SW * 0.35} ${SH * 0.04}`}
                stroke="#6366f1"
                strokeOpacity={0.07}
                strokeWidth={70}
                fill="none"
                strokeLinecap="round"
            />
            {/* Corner wash — bottom left */}
            <Path
                d={`M 0 ${SH} Q ${SW * 0.42} ${SH * 0.91} ${SW * 0.62} ${SH * 0.96}`}
                stroke="#10b981"
                strokeOpacity={0.06}
                strokeWidth={70}
                fill="none"
                strokeLinecap="round"
            />
        </Svg>
    );
}

const config = Constants.expoConfig;
const AppName = config?.name;
const description = config?.description;
export default function OnboardingIntroScreen() {
    const navigation = useNavigation<NavigationProp>();
    return (
        <ColView className="flex-1 gap-8">
            <SportyBackground />
            <ColView className="flex-1">
                <ColView className="flex-1 justify-center items-center">
                    <ColView className="justify-center items-center">
                        <Image
                            source={require("../../../assets/images/splash-icon.png")}
                            style={{ width: 140, height: 140 }}
                            resizeMode="contain"
                        />
                    </ColView>
                </ColView>
                <ColView className="px-4 justify-center items-center gap-4">
                    <Text className="text-4xl font-medium text-center">
                        Track your activity. Feel Better.
                    </Text>
                    <Text className="text-base text-muted-foreground text-center leading-relaxed">
                        Track every kilometer, hit your personal bests, and stay
                        consistent — one run at a time.
                    </Text>
                </ColView>
            </ColView>
            <View className="px-4 pb-12">
                <TouchableOpacity
                    className="h-16 rounded-full justify-center items-center bg-primary "
                    onPress={() =>
                        navigation.navigate("Onboarding", {
                            screen: "OnboardingSteps",
                        })
                    }
                >
                    <Text className="text-white font-medium">Get Started</Text>
                </TouchableOpacity>
            </View>
        </ColView>
    );
}
