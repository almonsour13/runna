import { ColView, RowView } from "@/shared/components/CustomView";
import Text from "@/shared/components/ui/Text";
import { capitalize } from "@/shared/utils/utils";
import { format } from "date-fns";
import { useActivityDetails } from "../context/ActivityDetailsContext";

export default function ActivityAbout() {
    const { activity } = useActivityDetails();
    return (
        <ColView className="px-4 gap-2 pb-8">
            <RowView className="items-center">
                <Text className="text-base text-foreground font-medium">
                    About
                </Text>
            </RowView>
            {[
                {
                    label: "Started",
                    value: format(activity.startTime, "h:mm:ss a"),
                },
                {
                    label: "Finished",
                    value: format(activity.endTime, "h:mm:ss a"),
                },
                {
                    label: "GPS points",
                    value: activity.coordinates.length.toLocaleString(),
                },
                {
                    label: "Status",
                    value: capitalize(activity.status),
                },
            ].map((item) => (
                <RowView key={item.label} className="justify-between">
                    <Text className="text-sm text-muted-foreground">
                        {item.label}
                    </Text>
                    <Text className="text-sm font-medium">{item.value}</Text>
                </RowView>
            ))}
        </ColView>
    );
}
