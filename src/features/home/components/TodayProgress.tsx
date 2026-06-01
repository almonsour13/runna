import { ColView, RowView } from "@/shared/components/CustomView";
import ActivityGroupDrawer, {
    ActivityGroupDrawerHandle,
} from "@/shared/components/drawer/ActivityGroupDrawer";
import Card from "@/shared/components/ui/Card";
import Icon from "@/shared/components/ui/Icon";
import Text from "@/shared/components/ui/Text";
import { activityService } from "@/shared/services/storage/activity.service";
import { cn } from "@/shared/utils/cn";
import { computeStats } from "@/shared/utils/compute";
import { convertMsToS, convertMtoKm } from "@/shared/utils/convert";
import { formatStats } from "@/shared/utils/format";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { useMemo, useRef } from "react";
import { ScrollView, TouchableOpacity } from "react-native";

function getPercentageChange(
    current: number,
    previous: number,
): { value: number; direction: "up" | "down" | "same" } | null {
    if (previous === 0) return null;
    const diff = ((current - previous) / previous) * 100;
    if (Math.abs(diff) < 0.5) return { value: 0, direction: "same" };
    return {
        value: Math.abs(diff),
        direction: diff > 0 ? "up" : "down",
    };
}

export default function TodayProgress() {
    const activityGrouperDrawer = useRef<ActivityGroupDrawerHandle>(null);
    const today = useMemo(() => new Date(), []);

    const {
        data: activities = [],
        isLoading,
        error,
    } = useQuery({
        queryKey: ["home", "today"],
        queryFn: async () => {
            const data = await activityService.getByDate(today);
            return data;
        },
    });

    const { data: previousActivities = [], isLoading: isPreviousLoading } =
        useQuery({
            queryKey: ["home", "today", "previous"],
            queryFn: async () => {
                return await activityService.getPreviousDayActivities(today);
            },
            staleTime: 0,
            enabled: activities.length > 0,
        });

    const { distance, calories, duration, goal, pace, speed, steps } =
        computeStats(activities);

    const {
        distance: prevDistance,
        calories: prevCalories,
        duration: prevDuration,
        steps: prevSteps,
    } = computeStats(previousActivities);

    const distanceKm = convertMtoKm(distance);
    const durationSec = convertMsToS(duration);
    const prevDistanceKm = convertMtoKm(prevDistance);
    const prevDurationSec = convertMsToS(prevDuration);

    const distanceChange = getPercentageChange(distanceKm, prevDistanceKm);
    const durationChange = getPercentageChange(durationSec, prevDurationSec);
    const caloriesChange = getPercentageChange(calories, prevCalories);
    const stepsChange = getPercentageChange(steps, prevSteps);

    const getChanges = (label: string) => {
        switch (label) {
            case "Distance":
                return distanceChange;
            case "Duration":
                return durationChange;
            case "Calories":
                return caloriesChange;
            case "Steps":
                return stepsChange;
            default:
                return null;
        }
    };
    const stats = formatStats({
        distance,
        duration,
        calories,
        steps,
    });

    const hasActivities = activities.length > 0;
    const hasPreviousActivities = previousActivities.length > 0;

    return (
        <>
            <ColView className="">
                <RowView className="px-4 justify-between items-end">
                    <RowView className="gap-0">
                        <Text className="text-lg font-medium">
                            Today's Progress
                        </Text>
                        <Text className="text-lg text-muted-foreground font-medium">
                            {" "}
                            • {format(today, "MMM d")}
                        </Text>
                    </RowView>
                    <TouchableOpacity
                        onPress={() =>
                            activityGrouperDrawer.current?.openWithActivityDate(
                                today,
                            )
                        }
                    >
                        {hasActivities && (
                            <Text className="text-base text-primary font-medium">
                                {activities.length}{" "}
                                {activities.length === 1
                                    ? "Activity"
                                    : "Activities"}
                            </Text>
                        )}
                    </TouchableOpacity>
                </RowView>
                <ColView className=" gap-2">
                    {isLoading || isPreviousLoading ? (
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerClassName="px-4 gap-2"
                        >
                            {Array.from({ length: 4 }).map((_, i) => (
                                <Card key={i} className="h-28 min-w-40" />
                            ))}
                        </ScrollView>
                    ) : (
                        <RowView className="flex-wrap px-4">
                            {isLoading
                                ? Array.from({ length: 4 }).map((_, i) => (
                                      <Card
                                          className="flex-1 min-w-[45%] gap-1 h-24"
                                          key={i}
                                      />
                                  ))
                                : stats.map((stat, i) => (
                                      <Card
                                          key={stat.label}
                                          className="flex-1 min-w-[45%]"
                                      >
                                          <ColView>
                                              <RowView className="justify-between">
                                                  <RowView className="items-center">
                                                      <Icon
                                                          name={stat.icon}
                                                          size={11}
                                                          className="text-primary"
                                                      />
                                                      <Text className="text-xs text-muted-foreground">
                                                          {stat.label}
                                                      </Text>
                                                  </RowView>
                                                  {hasPreviousActivities &&
                                                      hasActivities && (
                                                          <RowView>
                                                              {(() => {
                                                                  const change =
                                                                      getChanges(
                                                                          stat.label,
                                                                      );
                                                                  if (!change)
                                                                      return null;
                                                                  const {
                                                                      value,
                                                                      direction,
                                                                  } = change;
                                                                  const isUp =
                                                                      direction ===
                                                                      "up";

                                                                  const iconName =
                                                                      isUp
                                                                          ? "trending-up"
                                                                          : "trending-down";
                                                                  return (
                                                                      <RowView>
                                                                          <Icon
                                                                              name={
                                                                                  iconName
                                                                              }
                                                                              size={
                                                                                  12
                                                                              }
                                                                              className={cn(
                                                                                  isUp
                                                                                      ? "text-success"
                                                                                      : "text-destructive",
                                                                              )}
                                                                          />
                                                                          <Text
                                                                              className={cn(
                                                                                  "text-xs",
                                                                                  isUp
                                                                                      ? "text-success"
                                                                                      : "text-destructive",
                                                                              )}
                                                                          >
                                                                              {isUp
                                                                                  ? "+"
                                                                                  : "-"}
                                                                              {value.toFixed(
                                                                                  1,
                                                                              )}
                                                                              %
                                                                          </Text>
                                                                      </RowView>
                                                                  );
                                                              })()}
                                                          </RowView>
                                                      )}
                                              </RowView>

                                              <RowView>
                                                  {stat.value.map((v, i) => (
                                                      <Text
                                                          key={i}
                                                          className={cn(
                                                              "text-3xl font-medium",
                                                          )}
                                                      >
                                                          {v.value}
                                                          {stat.key !==
                                                              "duration" && " "}
                                                          <Text className="text-xl font-medium">
                                                              {v.unit}
                                                          </Text>
                                                      </Text>
                                                  ))}
                                              </RowView>
                                          </ColView>
                                      </Card>
                                  ))}
                        </RowView>
                    )}
                </ColView>
            </ColView>
            <ActivityGroupDrawer ref={activityGrouperDrawer} />
        </>
    );
}
