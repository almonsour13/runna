import ScheduleFormDrawer, {
    ScheduleFormDrawerHandle,
} from "@/features/schedule/components/ScheduleFormDrawer";
import Icon from "@/shared/components/Icon";
import Card from "@/shared/components/ui/Card";
import { cn } from "@/shared/utils/cn";
import { useRef } from "react";
import { TouchableOpacity } from "react-native";

export default function AddScheduleButton() {
    const scheduleFormDrawer = useRef<ScheduleFormDrawerHandle>(null);
    return (
        <>
            <TouchableOpacity
                className="absolute bottom-4 right-4"
                onPress={() => scheduleFormDrawer.current?.open()}
            >
                <Card
                    className={cn(
                        "relative bg-primary h-16 aspect-square justify-center items-center ",
                    )}
                >
                    <Icon name="add" size={24} className="text-white" />
                </Card>
            </TouchableOpacity>
            <ScheduleFormDrawer ref={scheduleFormDrawer} />
        </>
    );
}
