import { ColView, RowView } from "@/shared/components/CustomView";
import Drawer, { DrawerHandle } from "@/shared/components/ui/Drawer";
import Text from "@/shared/components/ui/Text";
import { Gender } from "@/shared/types/type";
import { cn } from "@/shared/utils/cn";
import { forwardRef, useImperativeHandle, useRef } from "react";
import { TouchableOpacity } from "react-native";
import Icon from "../ui/Icon";

interface Props {
    value?: Gender | null;
    onChange: (gender: Gender) => void;
}

const GenderDrawer = forwardRef<DrawerHandle, Props>(
    ({ value, onChange }, ref) => {
        const drawerRef = useRef<DrawerHandle>(null);

        useImperativeHandle(ref, () => ({
            open: () => drawerRef.current?.open(),
            close: () => drawerRef.current?.close(),
        }));
        const GENDER_OPTIONS = ["Male", "Female"];
        return (
            <Drawer ref={drawerRef}>
                <ColView className="py-4 gap-4">
                    <RowView className="px-4 justify-center">
                        <Text className="text-lg font-medium">
                            Choose Your Gender
                        </Text>
                    </RowView>

                    <ColView className="gap-0">
                        {GENDER_OPTIONS.map((gender) => {
                            const lowerCaseGender = gender.toLocaleLowerCase();
                            const isSelected = value === lowerCaseGender;
                            return (
                                <TouchableOpacity
                                    key={gender}
                                    onPress={() => {
                                        onChange(lowerCaseGender as Gender);
                                        drawerRef.current?.close();
                                    }}
                                    className={cn(
                                        "p-4 px-8 h-16 justify-center",
                                        isSelected && "bg-muted",
                                    )}
                                >
                                    <RowView className="justify-between">
                                        <Text
                                            className={cn(
                                                "text-lg",
                                                isSelected && "text-primary",
                                            )}
                                        >
                                            {gender}
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
                </ColView>
            </Drawer>
        );
    },
);

export default GenderDrawer;
