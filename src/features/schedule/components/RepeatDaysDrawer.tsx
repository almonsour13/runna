import { ColView, RowView } from "@/shared/components/CustomView";
import Drawer, { DrawerHandle } from "@/shared/components/ui/Drawer";
import Icon from "@/shared/components/ui/Icon";
import Text from "@/shared/components/ui/Text";
import { cn } from "@/shared/utils/cn";
import {
    forwardRef,
    useEffect,
    useImperativeHandle,
    useRef,
    useState,
} from "react";
import { TouchableOpacity } from "react-native";

interface Props {
    value?: number[] | null;
    onChange: (value: string) => void;
}
const DAY_LABELS = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
];
const RepeatDaysDrawer = forwardRef<DrawerHandle, Props>(
    ({ value, onChange }, ref) => {
        const drawerRef = useRef<DrawerHandle>(null);
        const [selectedRepeatDays, setSelectedRepeatDays] = useState<number[]>(
            [],
        );

        useImperativeHandle(ref, () => ({
            open: () => drawerRef.current?.open(),
            close: () => drawerRef.current?.close(),
        }));

        useEffect(() => {
            if (value) {
                setSelectedRepeatDays(value);
            }
        }, [value]);

        const toggleCustomDay = (dayIndex: number) => {
            setSelectedRepeatDays((prev) =>
                prev.includes(dayIndex)
                    ? prev.filter((d) => d !== dayIndex)
                    : [...prev, dayIndex].sort((a, b) => a - b),
            );
        };

        const confirmCustomDays = () => {
            onChange(JSON.stringify(selectedRepeatDays));
            drawerRef.current?.close();
        };
        return (
            <Drawer ref={drawerRef}>
                <ColView className="gap-4 py-4">
                    <RowView className="justify-center">
                        <Text className="text-lg font-medium">Select Days</Text>
                    </RowView>
                    <ColView className="gap-0">
                        {DAY_LABELS.map((day, i) => {
                            const isSelected = selectedRepeatDays.includes(i);
                            return (
                                <TouchableOpacity
                                    key={day}
                                    className={cn(
                                        "p-4 px-8 h-16 justify-center",
                                        isSelected && "bg-muted",
                                    )}
                                    onPress={() => toggleCustomDay(i)}
                                >
                                    <RowView className="justify-between">
                                        <Text
                                            className={cn(
                                                "text-lg capitalize",
                                                isSelected && "text-primary",
                                            )}
                                        >
                                            {day}
                                        </Text>
                                        {isSelected && (
                                            <Icon
                                                name="checkmark"
                                                size={20}
                                                className="text-primary"
                                            />
                                        )}
                                    </RowView>
                                </TouchableOpacity>
                            );
                        })}
                    </ColView>
                    <TouchableOpacity
                        className="mx-4 h-14 rounded-full bg-primary justify-center items-center"
                        onPress={confirmCustomDays}
                    >
                        <Text className="text-white font-medium">
                            Confirm ({selectedRepeatDays.length} days)
                        </Text>
                    </TouchableOpacity>
                </ColView>
            </Drawer>
        );
    },
);

export default RepeatDaysDrawer;
