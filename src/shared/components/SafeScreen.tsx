import { View, ViewProps } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface SafeScreenProps extends ViewProps {
    top?: boolean;
    bottom?: boolean;
    left?: boolean;
    right?: boolean;
}

export default function SafeScreen({
    children,
    top = true,
    bottom = true,
    left = false,
    right = false,
    style,
    ...props
}: SafeScreenProps) {
    const insets = useSafeAreaInsets();

    return (
        <View
            style={[
                {
                    flex: 1,
                    paddingTop: top ? insets.top : 0,
                    paddingBottom: bottom ? insets.bottom : 0,
                    paddingLeft: left ? insets.left : 0,
                    paddingRight: right ? insets.right : 0,
                },
                style,
            ]}
            {...props}
        >
            {children}
        </View>
    );
}
