import { ColView, RowView } from "@/shared/components/CustomView";
import Card from "@/shared/components/ui/Card";
import Icon from "@/shared/components/ui/Icon";
import Text from "@/shared/components/ui/Text";
import { NavigationProp } from "@/shared/types/type";
import { convertMtoKm } from "@/shared/utils/convert";
import { formatDurationReadable, formatPace } from "@/shared/utils/format";
import { useNavigation } from "@react-navigation/native";
import { format } from "date-fns";
import { useMemo } from "react";
import { TouchableOpacity } from "react-native";
import { useStatisticContext } from "../context/StatisticContext";

export default function StatisticPersonalBests() {
    const navigation = useNavigation<NavigationProp>();
    const { activities, isLoading } = useStatisticContext();

    const { longestDistance, longestDuration, mostCalories, bestPace } =
        useMemo(() => {
            if (!activities.length)
                return {
                    longestDistance: null,
                    longestDuration: null,
                    mostCalories: null,
                    bestPace: null,
                };

            const longestDistance = activities.reduce((a, b) =>
                a.distance > b.distance ? a : b,
            );
            const longestDuration = activities.reduce((a, b) =>
                a.duration > b.duration ? a : b,
            );
            const mostCalories = activities.reduce((a, b) =>
                a.calories > b.calories ? a : b,
            );
            const bestPace =
                activities
                    .filter((a) => (a.avgPace ?? 0) > 0)
                    .reduce(
                        (a, b) => (a.avgPace < b.avgPace ? a : b),
                        activities[0],
                    ) ?? null;

            return { longestDistance, longestDuration, mostCalories, bestPace };
        }, [activities]);
    if (!isLoading && (!longestDistance || !longestDuration || !mostCalories))
        return null;

    const formattedDuration = formatDurationReadable(
        longestDuration?.duration ?? 0,
    );
    const stats = [
        {
            id: longestDistance?.id ?? "",
            key: "distance",
            label: "Longest Distance",
            value: [
                {
                    value: convertMtoKm(longestDistance?.distance ?? 0).toFixed(
                        2,
                    ),
                    unit: "km",
                },
            ],
            date: longestDistance?.createdAt ?? null,
            icon: "navigate",
        },
        {
            id: longestDuration?.id ?? "",
            key: "duration",
            label: "Longest Duration",

            value: [
                {
                    value: formattedDuration.value[0].value,
                    unit: formattedDuration.value[0].unit,
                },
                {
                    value: formattedDuration.value[1].value,
                    unit: formattedDuration.value[1].unit,
                },
            ],
            date: longestDuration?.createdAt ?? null,
            icon: "time",
        },
        {
            id: mostCalories?.id ?? "",
            key: "calories",
            label: "Most Calories",
            value: [
                {
                    value: `${(mostCalories?.calories ?? 0).toFixed(0)}`,
                    unit: "kcal",
                },
            ],
            date: mostCalories?.createdAt ?? null,
            icon: "flame",
        },
        {
            id: bestPace?.id ?? "",
            key: "pace",
            label: "Best Pace",
            value: [
                {
                    value: formatPace(bestPace?.avgPace ?? 0),
                    unit: "min/km",
                },
            ],
            date: bestPace?.createdAt ?? null,
            icon: "timer",
        },
    ];

    return (
        <ColView className="px-4 gap-1">
            <Text className="text-lg font-medium">Personal Bests</Text>
            <ColView className="gap-1">
                {isLoading
                    ? Array.from({ length: 4 }).map((_, i) => (
                          <Card key={i} className="h-20" />
                      ))
                    : stats.map((stat) => (
                          <TouchableOpacity
                              key={stat.label}
                              className=""
                              onPress={() =>
                                  navigation.navigate("ActivityDetails", {
                                      activityId: stat.id,
                                  })
                              }
                          >
                              <Card>
                                  <RowView className="justify-between">
                                      <ColView>
                                          <RowView className="gap-2 items-center">
                                              <Icon
                                                  name={stat.icon}
                                                  size={12}
                                                  className="text-primary"
                                              />
                                              <Text className="text-sm text-muted-foreground">
                                                  {stat.label}
                                              </Text>
                                          </RowView>
                                          <RowView className="gap-2 items-center">
                                              <Icon
                                                  name="calendar"
                                                  size={10}
                                                  className="text-primary"
                                              />
                                              <Text className="text-xs text-muted-foreground">
                                                  {stat.date
                                                      ? format(
                                                            new Date(stat.date),
                                                            "MMM d, yyyy",
                                                        )
                                                      : "—"}
                                              </Text>
                                          </RowView>
                                      </ColView>
                                      <RowView>
                                          {stat.value.map((v, i) => (
                                              <Text
                                                  key={i}
                                                  className="text-2xl font-medium leading-none"
                                              >
                                                  {v.value}
                                                  {stat.key !== "duration" &&
                                                      " "}
                                                  <Text className="text-lg font-medium">
                                                      {v.unit}
                                                  </Text>
                                              </Text>
                                          ))}
                                      </RowView>
                                  </RowView>
                              </Card>
                          </TouchableOpacity>
                      ))}
            </ColView>
        </ColView>
    );
}
