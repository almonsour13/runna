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
    value?: number | null;
    onChange: (age: number) => void;
}

const ITEM_HEIGHT = 56;
const VISIBLE_ITEMS = 5;

const AgeDrawer = forwardRef<DrawerHandle, Props>(
    ({ value, onChange }, ref) => {
        const drawerRef = useRef<DrawerHandle>(null);

        useImperativeHandle(ref, () => ({
            open: () => drawerRef.current?.open(),
            close: () => drawerRef.current?.close(),
        }));

        const minAge = 12;
        const maxAge = 100;
        const ages = Array.from(
            { length: maxAge - minAge + 1 },
            (_, i) => minAge + i,
        );

        const [selectedAge, setSelectedAge] = useState(value ?? minAge);

        useEffect(() => {
            if (value != null) {
                setSelectedAge(value);
            }
        }, [value]);

        const initialIndex = Math.max(
            0,
            Math.min((value ?? minAge) - minAge, ages.length - 1),
        );

        const onScrollEnd = (
            event: NativeSyntheticEvent<NativeScrollEvent>,
        ) => {
            const offsetY = event.nativeEvent.contentOffset.y;
            const index = Math.round(offsetY / ITEM_HEIGHT);
            const selected =
                ages[Math.max(0, Math.min(index, ages.length - 1))];
            setSelectedAge(selected);
            onChange(selected);
        };
        const scrollY = useRef(0);
        const [activeIndex, setActiveIndex] = useState(initialIndex);

        const onScroll = (event: any) => {
            scrollY.current = event.nativeEvent.contentOffset.y;

            const index = Math.round(scrollY.current / ITEM_HEIGHT);
            setActiveIndex(index);
        };

        return (
            <Drawer ref={drawerRef} disableScrollView={true}>
                <ColView className="relative gap-4 p-4">
                    <RowView className="px-4 justify-center">
                        <Text className="text-base font-medium text-foreground">
                            Select Your Age
                        </Text>
                    </RowView>
                    <View className="relative">
                        <FlatList
                            data={ages}
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
                            onScroll={onScroll}
                            style={{
                                height: ITEM_HEIGHT * VISIBLE_ITEMS,
                            }}
                            renderItem={({ item }) => (
                                <View
                                    style={{
                                        height: ITEM_HEIGHT,
                                        justifyContent: "center",
                                        alignItems: "center",
                                    }}
                                >
                                    <Text
                                        className={cn(
                                            "text-foreground text-2xl",
                                            // activeIndex === ages.indexOf(item)
                                            //     ? "text-foreground"
                                            //     : "text-muted-foreground",
                                        )}
                                    >
                                        {item}
                                    </Text>
                                </View>
                            )}
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

export default AgeDrawer;
