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

const ITEM_HEIGHT = 56;
const VISIBLE_ITEMS = 5;

interface WeightProps {
    value?: number | null; // kg
    onChange: (kg: number) => void;
}

const minWeight = 30;
const maxWeight = 250;
const weights = Array.from(
    { length: maxWeight - minWeight + 1 },
    (_, i) => minWeight + i,
);

const WeightDrawer = forwardRef<DrawerHandle, WeightProps>(
    ({ value, onChange }, ref) => {
        const drawerRef = useRef<DrawerHandle>(null);

        useImperativeHandle(ref, () => ({
            open: () => drawerRef.current?.open(),
            close: () => drawerRef.current?.close(),
        }));

        const defaultWeight = value ?? 70;
        const [selectedWeight, setSelectedWeight] = useState(defaultWeight);

        useEffect(() => {
            if (value != null) setSelectedWeight(value);
        }, [value]);

        const initialIndex = Math.max(
            0,
            Math.min(defaultWeight - minWeight, weights.length - 1),
        );

        const onScrollEnd = (
            event: NativeSyntheticEvent<NativeScrollEvent>,
        ) => {
            const offsetY = event.nativeEvent.contentOffset.y;
            const index = Math.round(offsetY / ITEM_HEIGHT);
            const selected =
                weights[Math.max(0, Math.min(index, weights.length - 1))];
            setSelectedWeight(selected);
            onChange(selected);
        };

        return (
            <Drawer ref={drawerRef} disableScrollView={true}>
                <ColView className="relative gap-4 p-4">
                    <RowView className="px-4 justify-center">
                        <Text className="text-base font-medium text-foreground">
                            Select Your Weight
                        </Text>
                    </RowView>
                    <View className="relative">
                        <FlatList
                            data={weights}
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
                            style={{ height: ITEM_HEIGHT * VISIBLE_ITEMS }}
                            renderItem={({ item }) => {
                                const isSelected = item === selectedWeight;
                                return (
                                    <View
                                        style={{ height: ITEM_HEIGHT }}
                                        className="justify-center items-center"
                                    >
                                        <RowView className="items-end gap-1">
                                            <Text
                                                className={cn(
                                                    "text-muted-foreground text-2xl",
                                                    !isSelected && "opacity-30",
                                                    isSelected &&
                                                        "text-foreground text-3xl font-medium",
                                                )}
                                            >
                                                {item}
                                            </Text>
                                            <Text
                                                className={cn(
                                                    "text-sm pb-1 text-muted-foreground",
                                                    !isSelected && "opacity-30",
                                                )}
                                            >
                                                kg
                                            </Text>
                                        </RowView>
                                    </View>
                                );
                            }}
                        />
                        <View
                            style={{
                                height: ITEM_HEIGHT,
                                top:
                                    ITEM_HEIGHT * Math.floor(VISIBLE_ITEMS / 2),
                            }}
                            className="absolute -z-20 left-0 right-0 border-b border-t border-border/40"
                        />
                    </View>
                </ColView>
            </Drawer>
        );
    },
);

export default WeightDrawer;
