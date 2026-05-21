import { ColView, RowView } from "@/shared/components/CustomView";
import Drawer, { DrawerHandle } from "@/shared/components/ui/Drawer";
import Text from "@/shared/components/ui/Text";
import { cn } from "@/shared/utils/cn";
import {
    forwardRef,
    useEffect,
    useImperativeHandle,
    useRef,
    useState,
} from "react";
import {
    FlatList,
    NativeScrollEvent,
    NativeSyntheticEvent,
    View,
} from "react-native";

interface Props {
    value?: number | null; // in meters
    onChange: (meters: number) => void;
}

const ITEM_HEIGHT = 56;
const VISIBLE_ITEMS = 5;
const RECOMMENDED_KM = 5;

const GoalDrawer = forwardRef<DrawerHandle, Props>(
    ({ value, onChange }, ref) => {
        const drawerRef = useRef<DrawerHandle>(null);

        useImperativeHandle(ref, () => ({
            open: () => drawerRef.current?.open(),
            close: () => drawerRef.current?.close(),
        }));

        const minGoal = 1;
        const maxGoal = 100;
        const interval = 1;
        const goals = Array.from(
            { length: (maxGoal - minGoal) / interval + 1 },
            (_, i) => minGoal + i * interval,
        );

        const toKm = (meters: number) => Math.round(meters / 1000);
        const defaultKm = value != null ? toKm(value) : RECOMMENDED_KM;

        const [selectedGoal, setSelectedGoal] = useState(defaultKm);

        useEffect(() => {
            if (value != null) setSelectedGoal(toKm(value));
        }, [value]);

        const initialIndex = Math.max(
            0,
            Math.min((defaultKm - minGoal) / interval, goals.length - 1),
        );

        const onScrollEnd = (
            event: NativeSyntheticEvent<NativeScrollEvent>,
        ) => {
            const offsetY = event.nativeEvent.contentOffset.y;
            const index = Math.round(offsetY / ITEM_HEIGHT);
            const selectedKm =
                goals[Math.max(0, Math.min(index, goals.length - 1))];
            setSelectedGoal(selectedKm);
            onChange(selectedKm * 1000);
        };

        return (
            <Drawer ref={drawerRef} disableScrollView={true}>
                <ColView className="relative gap-4 p-4">
                    <RowView className="px-4 justify-center">
                        <Text className="text-lg font-medium text-foreground">
                            Select Your Goal
                        </Text>
                    </RowView>
                    <View className="relative">
                        <FlatList
                            data={goals}
                            keyExtractor={(item) => item.toString()}
                            snapToInterval={ITEM_HEIGHT}
                            decelerationRate="fast"
                            showsVerticalScrollIndicator={false}
                            onMomentumScrollEnd={onScrollEnd}
                            initialScrollIndex={initialIndex}
                            getItemLayout={(_, index) => ({
                                length: ITEM_HEIGHT,
                                offset: ITEM_HEIGHT * index,
                                index,
                            })}
                            contentContainerStyle={{
                                paddingVertical:
                                    ITEM_HEIGHT * Math.floor(VISIBLE_ITEMS / 2),
                            }}
                            style={{
                                height: ITEM_HEIGHT * VISIBLE_ITEMS,
                            }}
                            renderItem={({ item }) => {
                                const isSelected = item === selectedGoal;
                                const isRecommended = item === RECOMMENDED_KM;
                                return (
                                    <View
                                        style={{ height: ITEM_HEIGHT }}
                                        className="relative justify-center items-center"
                                    >
                                        <RowView className="items-end gap-1">
                                            <Text
                                                className={cn(
                                                    "text-foreground text-2xl",
                                                )}
                                            >
                                                {item}
                                            </Text>
                                            <Text
                                                className={cn(
                                                    "text-sm pb-1 text-foreground",
                                                )}
                                            >
                                                km
                                            </Text>
                                        </RowView>
                                        {isRecommended && (
                                            <View className="absolute z-40 right-0">
                                                <Text
                                                    className={cn(
                                                        "text-xs text-foreground",
                                                    )}
                                                >
                                                    Recommended
                                                </Text>
                                            </View>
                                        )}
                                    </View>
                                );
                            }}
                        />

                        <ColView
                            className="absolute inset-0 "
                            pointerEvents="none"
                        >
                            <View className="flex-1 bg-card/80" />
                            <View
                                style={{
                                    height: ITEM_HEIGHT,
                                }}
                                className=""
                            />
                            <View className="flex-1 bg-card/80" />
                        </ColView>
                    </View>
                </ColView>
            </Drawer>
        );
    },
);

export default GoalDrawer;
