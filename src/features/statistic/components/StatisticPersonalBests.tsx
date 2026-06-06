import { ColView, RowView } from "@/shared/components/CustomView";
import Card from "@/shared/components/ui/Card";
import Icon from "@/shared/components/ui/Icon";
import Text from "@/shared/components/ui/Text";
import { useSettingsStore } from "@/shared/stores/use-settings-store";
import { NavigationProp } from "@/shared/types/type";
import {
    formatDistanceByUnit,
    formatDurationReadable,
    formatPaceByUnit,
    formatSpeedByUnit,
} from "@/shared/utils/format";
import { useNavigation } from "@react-navigation/native";
import { format } from "date-fns";
import { useMemo } from "react";
import { TouchableOpacity } from "react-native";
import { useStatisticContext } from "../context/StatisticContext";

export default function StatisticPersonalBests() {
    const navigation = useNavigation<NavigationProp>();
    const preferences = useSettingsStore((s) => s.settings?.preferences);
    const unit = preferences?.unit || "kilometers";
    const { activities, isLoading } = useStatisticContext();

    const {
        longestDistance,
        longestDuration,
        mostCalories,
        bestPace,
        mostSteps,
        fastestSpeed,
    } = useMemo(() => {
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

        const mostSteps = activities.reduce((a, b) =>
            a.steps > b.steps ? a : b,
        );
        const fastestSpeed = activities.reduce((a, b) =>
            a.avgSpeed > b.avgSpeed ? a : b,
        );

        return {
            longestDistance,
            longestDuration,
            mostCalories,
            bestPace,
            mostSteps,
            fastestSpeed,
        };
    }, [activities]);
    if (
        !isLoading &&
        (!longestDistance ||
            !longestDuration ||
            !mostCalories ||
            !bestPace ||
            !mostSteps ||
            !fastestSpeed)
    )
        return null;

    const formattedDuration = formatDurationReadable(
        longestDuration?.duration ?? 0,
    );
    const formattedDistance = formatDistanceByUnit(
        longestDistance?.distance ?? 0,
        unit,
        false,
    );
    const formattedPace = formatPaceByUnit(bestPace?.avgPace ?? 0, unit);
    const formattedSpeed = formatSpeedByUnit(fastestSpeed?.avgSpeed ?? 0, unit);

    const stats = [
        {
            id: longestDistance?.id ?? "",
            key: "distance",
            label: "Longest Distance",
            value: [
                {
                    value: formattedDistance.value,
                    unit: formattedDistance.unit,
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
                    value: formattedPace.value,
                    unit: formattedPace.unit,
                },
            ],
            date: bestPace?.createdAt ?? null,
            icon: "timer",
        },
        {
            id: mostSteps?.id ?? "",
            key: "steps",
            label: "Most Steps",
            value: [
                {
                    value: mostSteps?.steps.toLocaleString() ?? 0,
                    unit: " ",
                },
            ],
            date: mostSteps?.createdAt ?? null,
            icon: "footsteps",
        },
        {
            id: fastestSpeed?.id ?? "",
            key: "speed",
            label: "Fastest Speed",
            value: [
                {
                    value: formattedSpeed.value,
                    unit: formattedSpeed.unit,
                },
            ],
            date: fastestSpeed?.createdAt ?? null,
            icon: "speedometer",
        },
    ];

    return (
        <ColView className="px-4 gap-1">
            <Text className="text-lg font-medium">Personal Bests</Text>
            <RowView className="gap-1 flex-wrap">
                {isLoading
                    ? Array.from({ length: 6 }).map((_, i) => (
                          <Card key={i} className="flex-1 h-28 min-w-[45%]" />
                      ))
                    : stats.map((stat) => (
                          <TouchableOpacity
                              key={stat.label}
                              className="flex-1 min-w-[45%]"
                              onPress={() =>
                                  navigation.navigate("ActivityDetails", {
                                      activityId: stat.id,
                                  })
                              }
                          >
                              <Card>
                                  <RowView className="justify-between">
                                      <ColView>
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
                                                      className="text-2xl font-medium leading-none"
                                                  >
                                                      {v.value}
                                                      {stat.key !==
                                                          "duration" && " "}
                                                      <Text className="text-lg font-medium">
                                                          {v.unit}
                                                      </Text>
                                                  </Text>
                                              ))}
                                          </RowView>
                                          <RowView className="gap-1 items-center">
                                              <Icon
                                                  name="calendar"
                                                  size={10}
                                                  className="text-muted-foreground"
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
                                  </RowView>
                              </Card>
                          </TouchableOpacity>
                      ))}
            </RowView>
        </ColView>
    );
}
