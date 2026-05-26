import { ColView, RowView } from "@/shared/components/CustomView";
import Icon from "@/shared/components/Icon";
import Card from "@/shared/components/ui/Card";
import Text from "@/shared/components/ui/Text";
import { formatStats } from "@/shared/utils/format";
import { useMemo } from "react";
import { useStatisticContext } from "../context/StatisticContext";

export default function StatisticSummary() {
    const { activities, isLoading } = useStatisticContext();

    const { distance, duration, calories, steps } = useMemo(
        () => ({
            distance: activities.reduce((acc, a) => acc + a.distance, 0),
            duration: activities.reduce((acc, a) => acc + a.duration, 0),
            calories: activities.reduce((acc, a) => acc + a.calories, 0),
            steps: activities.reduce((acc, a) => acc + a.steps, 0),
        }),
        [activities],
    );

    const stats = formatStats({
        distance,
        duration,
        calories,
        steps,
    });
    return (
        <ColView className="px-4 gap-2">
            <Text className="text-lg font-medium">Summary</Text>
            <ColView className="gap-1">
                <RowView className="gap-2 flex-wrap">
                    {isLoading
                        ? Array.from({ length: 4 }).map((_, i) => (
                              <Card
                                  className="flex-1 min-w-[45%] gap-1 h-24"
                                  key={i}
                              />
                          ))
                        : stats.map((stat) => (
                              <Card
                                  className="flex-1 min-w-[45%] gap-1"
                                  key={stat.label}
                              >
                                  {isLoading ? (
                                      <ColView className="gap-1">
                                          <RowView className="gap-1">
                                              <Card className="flex-1 h-14" />
                                          </RowView>
                                      </ColView>
                                  ) : (
                                      <ColView className="gap-1">
                                          <RowView className="gap-1 items-center">
                                              <Icon
                                                  name={stat.icon}
                                                  size={11}
                                                  className="text-primary"
                                              />
                                              <Text className="text-xs text-muted-foreground">
                                                  {stat.label}
                                              </Text>
                                          </RowView>
                                          <Text className="text-3xl font-medium">
                                              {stat.value}{" "}
                                              {stat.unit && (
                                                  <Text className="text-xs font-normal text-muted-foreground">
                                                      {stat.unit}
                                                  </Text>
                                              )}
                                          </Text>
                                      </ColView>
                                  )}
                              </Card>
                          ))}
                </RowView>
            </ColView>
        </ColView>
    );
}
