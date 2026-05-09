import Constants from "expo-constants";
import {
    forwardRef,
    memo,
    useCallback,
    useImperativeHandle,
    useRef,
    useState,
} from "react";
import {
    Animated,
    Dimensions,
    LayoutChangeEvent,
    Modal,
    PanResponder,
    ScrollView,
    StyleSheet,
    TouchableWithoutFeedback,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { cn } from "../../utils/cn";
const { height: SCREEN_HEIGHT } = Dimensions.get("window");

const DISMISS_THRESHOLD = 120;
const ANIMATION_DURATION = 300;

export interface DrawerHandle {
    close: () => void;
    open: () => void;
}
interface Props {
    className?: string;
    children?: React.ReactNode;
    disableBackdrop?: boolean;
    disableHandle?: boolean;
    disableScrollView?: boolean;
    onClose?: () => void;
}
const MAX_HEIGHT = SCREEN_HEIGHT * 0.9;

const IS_EXPO_GO = Constants.appOwnership === "expo";
const DrawerComponent = forwardRef<DrawerHandle, Props>(function Drawer(
    {
        children,
        className,
        disableBackdrop = false,
        disableHandle = false,
        disableScrollView = false,
        onClose,
    },
    ref,
) {
    const insets = useSafeAreaInsets();
    const [isVisible, setIsVisible] = useState(false);
    const sheetHeightRef = useRef(SCREEN_HEIGHT);
    const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
    const dragY = useRef(new Animated.Value(0)).current;
    const backdropOpacity = useRef(new Animated.Value(0)).current;
    const lastGestureDy = useRef(0);

    const openSheet = useCallback(() => {
        setIsVisible(true);
    }, []);
    const closeSheet = useCallback(() => {
        setIsVisible(false);
    }, []);

    const animateOpen = useCallback(() => {
        Animated.parallel([
            Animated.spring(translateY, {
                toValue: 0,
                damping: 20,
                stiffness: 180,
                useNativeDriver: true,
            }),
            Animated.timing(backdropOpacity, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }),
        ]).start();
    }, [translateY, backdropOpacity]);

    const animateClose = useCallback(() => {
        Animated.parallel([
            Animated.timing(translateY, {
                toValue: sheetHeightRef.current,
                duration: ANIMATION_DURATION,
                useNativeDriver: true,
            }),
            Animated.timing(backdropOpacity, {
                toValue: 0,
                duration: ANIMATION_DURATION,
                useNativeDriver: true,
            }),
        ]).start(() => {
            setIsVisible(false);
            onClose?.();
        });
    }, [translateY, backdropOpacity, onClose]);

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => !disableHandle,
            onMoveShouldSetPanResponder: (_, { dy }) =>
                !disableHandle && dy > 5,
            onPanResponderGrant: () => {
                dragY.setValue(0);
            },
            onPanResponderMove: (_, { dy }) => {
                if (dy < 0) return; // prevent dragging upward
                lastGestureDy.current = dy;
                dragY.setValue(dy);
            },
            onPanResponderRelease: (_, { dy, vy }) => {
                if (dy > DISMISS_THRESHOLD || vy > 0.8) {
                    translateY.setValue((translateY as any)._value + dy);
                    dragY.setValue(0);
                    animateClose();
                } else {
                    Animated.spring(dragY, {
                        toValue: 0,
                        damping: 20,
                        stiffness: 300,
                        useNativeDriver: true,
                    }).start();
                }
            },
        }),
    ).current;

    const combinedTranslate = Animated.add(translateY, dragY);

    // Derive backdrop opacity from drag position
    const backdropAnimatedOpacity = Animated.multiply(
        backdropOpacity,
        dragY.interpolate({
            inputRange: [0, DISMISS_THRESHOLD * 2],
            outputRange: [1, 0.2],
            extrapolate: "clamp",
        }),
    );

    useImperativeHandle(ref, () => {
        return {
            open: openSheet,
            close: animateClose,
        };
    });

    return (
        <Modal
            visible={isVisible}
            transparent
            animationType="none"
            statusBarTranslucent
            onShow={animateOpen}
            onRequestClose={animateClose}
        >
            <TouchableWithoutFeedback
                disabled={disableBackdrop}
                onPress={animateClose}
            >
                <Animated.View
                    style={[
                        StyleSheet.absoluteFillObject,
                        styles.backdrop,
                        { opacity: backdropAnimatedOpacity },
                    ]}
                />
            </TouchableWithoutFeedback>
            <Animated.View
                style={[
                    styles.sheet,
                    {
                        transform: [{ translateY: combinedTranslate }],
                        // maxHeight: MAX_HEIGHT,
                    },
                ]}
                onLayout={(e: LayoutChangeEvent) => {
                    const h = e.nativeEvent.layout.height;
                    if (h === 0) return;
                    sheetHeightRef.current = h;
                }}
            >
                <View
                    className={cn(
                        "bg-card overflow-hidden rounded-t-2xl",
                        className,
                    )}
                    style={{
                        maxHeight: MAX_HEIGHT,
                        flex: 1,
                        ...(!IS_EXPO_GO
                            ? { paddingBottom: insets.bottom }
                            : {}),
                    }}
                >
                    {!disableHandle && (
                        <View
                            className="py-4 justify-center items-center"
                            {...panResponder.panHandlers}
                        >
                            <View className="w-16 h-1.5 rounded-full bg-muted-foreground/50" />
                        </View>
                    )}
                    {!disableScrollView ? (
                        <ScrollView
                            showsHorizontalScrollIndicator={false}
                            showsVerticalScrollIndicator={false}
                        >
                            {children}
                        </ScrollView>
                    ) : (
                        children
                    )}
                </View>
            </Animated.View>
        </Modal>
    );
});
const Drawer = DrawerComponent;
export default memo(Drawer);
const styles = StyleSheet.create({
    backdrop: {
        backgroundColor: "rgba(0,0,0, 0.5)",
    },
    sheet: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
    },
});
