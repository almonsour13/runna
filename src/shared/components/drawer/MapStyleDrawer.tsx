import { ColView, RowView } from "@/shared/components/CustomView";
import Drawer, { DrawerHandle } from "@/shared/components/ui/Drawer";
import Text from "@/shared/components/ui/Text";
import { MAP_STYLES } from "@/shared/constant/map";
import { useTheme } from "@/shared/hooks/use-theme";
import { cn } from "@/shared/utils/cn";
import { Map } from "@maplibre/maplibre-react-native";
import { forwardRef, useImperativeHandle, useRef } from "react";
import { TouchableOpacity, View } from "react-native";
import Icon from "../ui/Icon";

interface Props {
    value?: string | null;
    onChange: (value: string) => void;
}

const MapStyleDrawer = forwardRef<DrawerHandle, Props>(
    ({ value, onChange }, ref) => {
        const drawerRef = useRef<DrawerHandle>(null);
        const theme = useTheme();

        useImperativeHandle(ref, () => ({
            open: () => drawerRef.current?.open(),
            close: () => drawerRef.current?.close(),
        }));

        return (
            <Drawer ref={drawerRef}>
                <ColView className="gap-4 py-4">
                    <RowView className="justify-center">
                        <Text className="text-lg font-medium">
                            Select Map Style
                        </Text>
                    </RowView>

                    {/* Map Preview */}

                    {/* Style Options */}
                    <ColView className="gap-0">
                        {MAP_STYLES.map((mapStyle, index) => {
                            const isSelected = value === mapStyle.name;
                            const name = mapStyle.name;
                            const style = mapStyle.style;
                            return (
                                <TouchableOpacity
                                    key={index}
                                    className={cn(
                                        "p-4 px-4 h-16 justify-center",
                                        isSelected && "bg-muted",
                                    )}
                                    onPress={() => {
                                        onChange(name);
                                        drawerRef.current?.close();
                                    }}
                                >
                                    <RowView className="gap-4 items-center">
                                        <View className="rounded overflow-hidden h-12 w-12 bg-muted">
                                            <Map
                                                style={{ flex: 1 }}
                                                mapStyle={style}
                                                logo={false}
                                                attribution={false}
                                                compass={false}
                                                touchZoom={false}
                                                touchRotate={false}
                                                touchPitch={false}
                                                doubleTapZoom={false}
                                                dragPan={false}
                                                doubleTapHoldZoom={false}
                                            />
                                        </View>
                                        <RowView className="flex-1 justify-between">
                                            <Text
                                                className={cn(
                                                    "text-lg",
                                                    isSelected &&
                                                        "text-primary",
                                                )}
                                            >
                                                {mapStyle.name}
                                            </Text>
                                            {isSelected && (
                                                <Icon
                                                    name="checkmark"
                                                    size={20}
                                                    className="text-primary"
                                                />
                                            )}
                                        </RowView>
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

export default MapStyleDrawer;
