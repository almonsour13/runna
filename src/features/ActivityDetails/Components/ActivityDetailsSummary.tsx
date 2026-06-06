import { ColView, RowView } from "@/shared/components/CustomView";
import Card from "@/shared/components/ui/Card";
import Icon from "@/shared/components/ui/Icon";
import Text from "@/shared/components/ui/Text";
import { ACTIVITY_TYPE_COLOR } from "@/shared/constant/constant";
import { useFormatMetrics } from "@/shared/hooks/use-format-metrics";
import { useUnit } from "@/shared/hooks/use-unit";
import { ActivityType } from "@/shared/types/type";
import { formatRelativeDateLabel } from "@/shared/utils/format";
import { format } from "date-fns";
import { View } from "react-native";
import { useActivityDetailsContext } from "../context/ActivityDetailsContext";

export default function ActivityDetailsSummary() {
    const { activity } = useActivityDetailsContext();

    if (!activity) return null;
    const {
        id,
        startTime,
        endTime,
        distance,
        calories,
        duration,
        avgPace,
        avgSpeed,
        steps,
        goal,
        type,
        source,
        coordinates,
    } = activity;

    const pct = (distance / goal) * 100 || 0;
    const barPct = Math.min(pct, 100);
    const formattedDistance = useUnit(distance);
    const formattedGoal = useUnit(goal);
    const isGoalMet = distance >= goal;
    const isGoalExceeded = pct > 100;

    const dateLabel =
        activity &&
        [
            formatRelativeDateLabel(new Date(activity.startTime)),
            format(activity.startTime, "EEE"),
            format(activity.startTime, "MMM d, yyy"),
        ]
            .filter(Boolean)
            .join(" • ");

    const timeRangeLabel =
        activity &&
        [
            format(activity.startTime, "h:mm a"),
            activity.endTime && format(activity.endTime, "h:mm a"),
        ].join(" - ");
    const stats = useFormatMetrics({
        distance,
        duration,
        calories,
        pace: avgPace,
        speed: avgSpeed,
        steps,
    });
    const isImported = activity.source === "imported";
    return (
        <ColView className="p-4 gap-4 ">
            <RowView className="justify-between items-start">
                <ColView className="gap-1">
                    <Text className="text-lg font-medium">{dateLabel}</Text>
                    <Text className="text-sm font-medium text-muted-foreground">
                        {timeRangeLabel}
                    </Text>
                </ColView>
                <RowView>
                    {isImported && (
                        <Text className="capitalize text-xs font-medium text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                            Imported
                        </Text>
                    )}
                    <Text
                        className="capitalize text-xs font-medium text-primary bg-muted px-1.5 py-0.5 rounded"
                        style={{
                            color: ACTIVITY_TYPE_COLOR[
                                activity.type as ActivityType
                            ],
                        }}
                    >
                        {activity.type}
                    </Text>
                </RowView>
            </RowView>
            <ColView>
                <RowView className="justify-between items-center">
                    <Text className="text-lg font-medium">Goal Progress</Text>
                    <RowView>
                        {isGoalExceeded && (
                            <Text className="capitalize text-xs font-medium text-primary bg-muted px-1.5 py-0.5 rounded">
                                +{(pct - 100).toFixed(0)}% over
                            </Text>
                        )}
                        {isGoalMet && (
                            <Text className="capitalize text-xs font-medium text-primary bg-muted px-1.5 py-0.5 rounded">
                                Goal Met
                            </Text>
                        )}
                    </RowView>
                </RowView>
                <View className="h-1 bg-muted rounded-full overflow-hidden">
                    <View
                        style={{
                            width: `${barPct}%`,
                        }}
                        className="h-1 bg-primary rounded-full"
                    />
                </View>
                <RowView className="justify-between">
                    <RowView className="items-center gap-1">
                        <Icon
                            name="navigate"
                            size={12}
                            className="text-primary"
                        />
                        <Text className="text-sm">
                            {formattedDistance.value}
                        </Text>
                    </RowView>
                    <Text className="text-sm text-primary">
                        {pct.toFixed(1)} %
                    </Text>
                    <RowView className="items-center gap-1">
                        <Icon name="flag" size={12} className="text-primary" />
                        <Text className="text-sm">{formattedGoal.value}</Text>
                    </RowView>
                </RowView>
            </ColView>

            <ColView className="">
                <RowView className="justify-between items-center">
                    <Text className="text-lg font-medium">Metrics</Text>
                </RowView>
                <RowView className="gap-1 flex-wrap">
                    {stats.map((stat, i) => {
                        return (
                            <Card
                                key={stat.label}
                                className="flex-1 min-w-[30%]"
                            >
                                <ColView>
                                    <RowView className="items-center gap-1">
                                        <Icon
                                            name={stat.icon}
                                            size={11}
                                            className="text-primary"
                                        />
                                        <Text className="text-xs text-muted-foreground">
                                            {stat.label}
                                        </Text>
                                    </RowView>
                                    <RowView>
                                        {stat.value.map((v, i) => (
                                            <Text
                                                key={i}
                                                className="text-xl font-medium leading-none"
                                            >
                                                {v.value}
                                                {stat.key !== "duration" && " "}
                                                <Text className="text-sm font-medium">
                                                    {v.unit}
                                                </Text>
                                            </Text>
                                        ))}
                                    </RowView>
                                </ColView>
                            </Card>
                        );
                    })}
                </RowView>
            </ColView>
            <ColView className="hidden">
                <RowView className="justify-between items-center">
                    <Text className="text-lg font-medium">More Info.</Text>
                </RowView>
            </ColView>
        </ColView>
    );
}
