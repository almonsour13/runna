import { ColView, RowView } from "@/shared/components/CustomView";
import Drawer, { DrawerHandle } from "@/shared/components/ui/Drawer";
import Text from "@/shared/components/ui/Text";
import { cn } from "@/shared/utils/cn";
import { convertFtInToCm } from "@/shared/utils/convert";
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

interface HeightProps {
    value?: number | null; // cm
    onChange: (cm: number) => void;
}
interface HeightItem {
    cm: number;
    label: string;
}
const heightsImperial: HeightItem[] = (() => {
    const list: HeightItem[] = [];
    const minFtIn = { ft: 3, inches: 3 }; // ~100cm
    const maxFtIn = { ft: 9, inches: 10 }; // ~300cm
    for (let ft = minFtIn.ft; ft <= maxFtIn.ft; ft++) {
        const startIn = ft === minFtIn.ft ? minFtIn.inches : 0;
        const endIn = ft === maxFtIn.ft ? maxFtIn.inches : 11;
        for (let inches = startIn; inches <= endIn; inches++) {
            const cm = convertFtInToCm(ft, inches);
            list.push({ cm, label: `${ft}'${inches}"` });
        }
    }
    return list;
})();
const HeightDrawer = forwardRef<DrawerHandle, HeightProps>(
    ({ value, onChange }, ref) => {
        const drawerRef = useRef<DrawerHandle>(null);

        useImperativeHandle(ref, () => ({
            open: () => drawerRef.current?.open(),
            close: () => drawerRef.current?.close(),
        }));

        const defaultHeight = value ?? 170;
        const [selectedHeight, setSelectedHeight] = useState(defaultHeight);

        useEffect(() => {
            if (value != null) setSelectedHeight(value);
        }, [value]);

        const initialIndex = Math.max(
            0,
            Math.min(
                (defaultHeight - heightsImperial[0].cm) / 2.54,
                heightsImperial.length - 1,
            ),
        );

        const onScrollEnd = (
            event: NativeSyntheticEvent<NativeScrollEvent>,
        ) => {
            const offsetY = event.nativeEvent.contentOffset.y;
            const index = Math.round(offsetY / ITEM_HEIGHT);
            const selected =
                heightsImperial[
                    Math.max(0, Math.min(index, heightsImperial.length - 1))
                ];
            setSelectedHeight(selected.cm);
            onChange(selected.cm);
        };

        return (
            <Drawer ref={drawerRef} disableScrollView={true}>
                <ColView className="relative gap-4 p-4">
                    <RowView className="px-4 justify-center">
                        <Text className="text-lg font-medium">
                            Select Your Height
                        </Text>
                    </RowView>
                    <View className="relative">
                        <FlatList
                            data={heightsImperial}
                            keyExtractor={(item) => item.cm.toString()}
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
                                const isSelected = item.cm === selectedHeight;
                                return (
                                    <View
                                        style={{ height: ITEM_HEIGHT }}
                                        className="justify-center items-center"
                                    >
                                        <RowView className="items-end gap-1">
                                            <RowView className="gap-8">
                                                <Text
                                                    className={cn("text-2xl")}
                                                >
                                                    {item.label}
                                                </Text>
                                                <Text
                                                    className={cn("text-2xl")}
                                                >
                                                    {item.cm}{" "}
                                                    <Text className="text-base">
                                                        cm
                                                    </Text>
                                                </Text>
                                            </RowView>
                                            <Text
                                                className={cn("text-sm pb-1")}
                                            ></Text>
                                        </RowView>
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

export default HeightDrawer;
