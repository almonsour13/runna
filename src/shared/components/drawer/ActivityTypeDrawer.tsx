import { ColView, RowView } from "@/shared/components/CustomView";
import Drawer, { DrawerHandle } from "@/shared/components/ui/Drawer";
import Text from "@/shared/components/ui/Text";
import { ACTIVITY_TYPE } from "@/shared/constant/constant";
import { cn } from "@/shared/utils/cn";
import { capitalize } from "@/shared/utils/utils";
import Ionicons from "@expo/vector-icons/Ionicons";
import { forwardRef, useImperativeHandle, useRef } from "react";
import { TouchableOpacity } from "react-native";

interface Props {
    value?: string | null;
    onChange: (type: string) => void;
}

const ActivityTypeDrawer = forwardRef<DrawerHandle, Props>(
    ({ value, onChange }, ref) => {
        const drawerRef = useRef<DrawerHandle>(null);

        useImperativeHandle(ref, () => ({
            open: () => drawerRef.current?.open(),
            close: () => drawerRef.current?.close(),
        }));
        return (
            <Drawer ref={drawerRef}>
                <ColView className="gap-4 py-4">
                    <RowView className="justify-center">
                        <Text className="text-lg font-medium text-foreground">
                            Select Type
                        </Text>
                    </RowView>
                    <ColView className="gap-0">
                        {ACTIVITY_TYPE.map((type) => {
                            const isSelected = value === type;
                            return (
                                <TouchableOpacity
                                    key={type}
                                    className={cn(
                                        "p-4 px-8 h-16 justify-center",
                                        isSelected && "bg-muted",
                                    )}
                                    onPress={() => {
                                        onChange(type);
                                        drawerRef.current?.close();
                                    }}
                                >
                                    <RowView className="justify-between">
                                        <Text
                                            className={cn(
                                                "text-lg",
                                                isSelected && "text-primary",
                                            )}
                                        >
                                            {capitalize(type)}
                                        </Text>
                                        {isSelected && (
                                            <Ionicons
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
                </ColView>
            </Drawer>
        );
    },
);

export default ActivityTypeDrawer;
