import { ColView, RowView } from "@/shared/components/CustomView";
import Card from "@/shared/components/ui/Card";
import Icon from "@/shared/components/ui/Icon";
import Text from "@/shared/components/ui/Text";
import { useFormatMetrics } from "@/shared/hooks/use-format-metrics";
import { cn } from "@/shared/utils/cn";
import { computeMetrics } from "@/shared/utils/compute";
import { useStatisticContext } from "../context/StatisticContext";

export default function StatisticSummary() {
    const { activities, isLoading } = useStatisticContext();

    const { distance, calories, duration, goal, pace, speed, steps } =
        computeMetrics(activities);

    const stats = useFormatMetrics({
        distance,
        duration,
        calories,
        steps,
    });

    return (
        <ColView className="px-4 gap-2">
            <Text className="text-lg font-medium">Summary</Text>
            <ColView className="gap-1">
                <RowView className="gap-1 flex-wrap">
                    {isLoading
                        ? Array.from({ length: 4 }).map((_, i) => (
                              <Card
                                  className="flex-1 min-w-[45%] gap-1 h-20"
                                  key={i}
                              />
                          ))
                        : stats.map((stat) => (
                              <Card
                                  key={stat.label}
                                  className="flex-1 min-w-[45%]"
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
                                                  size={12}
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
                                                      className={cn(
                                                          "text-2xl font-medium",
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
                                  )}
                              </Card>
                          ))}
                </RowView>
            </ColView>
        </ColView>
    );
}
