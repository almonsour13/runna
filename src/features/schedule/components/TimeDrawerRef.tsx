import { ColView, RowView } from "@/shared/components/CustomView";
import Drawer, { DrawerHandle } from "@/shared/components/ui/Drawer";
import Text from "@/shared/components/ui/Text";
import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import {
    FlatList,
    NativeScrollEvent,
    NativeSyntheticEvent,
    TouchableOpacity,
    View,
} from "react-native";

interface Props {
    value?: string | null; // "07:30 AM"
    onChange: (time: string) => void;
}

const ITEM_HEIGHT = 56;
const VISIBLE_ITEMS = 5;

const HOURS = Array.from({ length: 12 }, (_, i) => i + 1); // 1–12
const MINUTES = Array.from({ length: 60 }, (_, i) => i); // 0–59
const PERIODS = ["AM", "PM"];

const pad = (n: number) => n.toString().padStart(2, "0");

// parse "07:30 AM" → { hour: 7, minute: 30, periodIndex: 0 }
const parseTime = (value?: string | null) => {
    if (!value) return { hourIndex: 6, minuteIndex: 0, periodIndex: 0 }; // default 7:00 AM
    const [time, period] = value.split(" ");
    const [h, m] = time.split(":").map(Number);
    return {
        hourIndex: (h % 12 || 12) - 1, // 0-based index into HOURS
        minuteIndex: m,
        periodIndex: period === "PM" ? 1 : 0,
    };
};

// ✅ Extracted reusable scroll column
const ScrollColumn = ({
    data,
    initialIndex,
    onSelect,
    formatLabel,
}: {
    data: (number | string)[];
    initialIndex: number;
    onSelect: (index: number) => void;
    formatLabel: (item: number | string) => string;
}) => {
    const scrollY = useRef(0);

    const onScroll = (event: any) => {
        scrollY.current = event.nativeEvent.contentOffset.y;
    };

    const onScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const index = Math.round(
            event.nativeEvent.contentOffset.y / ITEM_HEIGHT,
        );
        const clamped = Math.max(0, Math.min(index, data.length - 1));
        onSelect(clamped);
    };

    return (
        <View className="relative flex-1">
            <FlatList
                data={data}
                keyExtractor={(_, i) => i.toString()}
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
                style={{ height: ITEM_HEIGHT * VISIBLE_ITEMS }}
                renderItem={({ item, index }) => (
                    <View
                        style={{
                            height: ITEM_HEIGHT,
                            justifyContent: "center",
                            alignItems: "center",
                        }}
                    >
                        <Text className="text-foreground text-2xl">
                            {formatLabel(item)}
                        </Text>
                    </View>
                )}
            />
            <ColView className="absolute inset-0" pointerEvents="none">
                <View className="flex-1 bg-card/80" />
                <View style={{ height: ITEM_HEIGHT }} />
                <View className="flex-1 bg-card/80" />
            </ColView>
            <View
                pointerEvents="none"
                className="absolute left-0 right-0 border-y border-muted"
                style={{
                    top: ITEM_HEIGHT * Math.floor(VISIBLE_ITEMS / 2),
                    height: ITEM_HEIGHT,
                }}
            />
        </View>
    );
};

const TimeDrawer = forwardRef<DrawerHandle, Props>(
    ({ value, onChange }, ref) => {
        const drawerRef = useRef<DrawerHandle>(null);

        useImperativeHandle(ref, () => ({
            open: () => drawerRef.current?.open(),
            close: () => drawerRef.current?.close(),
        }));

        const parsed = parseTime(value);

        const [hourIndex, setHourIndex] = useState(parsed.hourIndex);
        const [minuteIndex, setMinuteIndex] = useState(parsed.minuteIndex);
        const [periodIndex, setPeriodIndex] = useState(parsed.periodIndex);

        const handleConfirm = () => {
            const hour = HOURS[hourIndex];
            const minute = MINUTES[minuteIndex];
            const period = PERIODS[periodIndex];
            onChange(`${pad(hour)}:${pad(minute)} ${period}`);
            drawerRef.current?.close();
        };

        return (
            <Drawer ref={drawerRef} disableScrollView={true}>
                <ColView className="gap-4 p-4">
                    <RowView className="justify-center">
                        <Text className="text-lg font-medium text-foreground">
                            Select Time
                        </Text>
                    </RowView>

                    <RowView className="items-center">
                        <ScrollColumn
                            data={HOURS}
                            initialIndex={hourIndex}
                            onSelect={setHourIndex}
                            formatLabel={(item) => pad(item as number)}
                        />

                        <Text className="text-2xl font-bold text-foreground pb-1">
                            :
                        </Text>
                        <ScrollColumn
                            data={MINUTES}
                            initialIndex={minuteIndex}
                            onSelect={setMinuteIndex}
                            formatLabel={(item) => pad(item as number)}
                        />
                        <ScrollColumn
                            data={PERIODS}
                            initialIndex={periodIndex}
                            onSelect={setPeriodIndex}
                            formatLabel={(item) => item as string}
                        />
                    </RowView>
                    <TouchableOpacity
                        className="h-14 rounded-full bg-primary justify-center items-center"
                        onPress={handleConfirm}
                    >
                        <Text className="text-white font-semibold">
                            Confirm {pad(HOURS[hourIndex])}:
                            {pad(MINUTES[minuteIndex])} {PERIODS[periodIndex]}
                        </Text>
                    </TouchableOpacity>
                </ColView>
            </Drawer>
        );
    },
);

export default TimeDrawer;
