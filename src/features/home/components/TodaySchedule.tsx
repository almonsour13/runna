import { ColView, RowView } from "@/shared/components/CustomView";
import Divider from "@/shared/components/Divider";
import Card from "@/shared/components/ui/Card";
import Icon from "@/shared/components/ui/Icon";
import Text from "@/shared/components/ui/Text";
import { ACTIVITY_TYPE_COLOR } from "@/shared/constant/constant";
import { scheduleService } from "@/shared/services/storage/schedule.service";
import { ActivityType, NavigationProp } from "@/shared/types/type";
import { cn } from "@/shared/utils/cn";
import { convertMtoKm } from "@/shared/utils/convert";
import { useNavigation } from "@react-navigation/native";
import { useQuery } from "@tanstack/react-query";
import { addMinutes, format, isBefore } from "date-fns";
import { useMemo } from "react";
import { ScrollView, TouchableOpacity } from "react-native";

export default function TodaySchedule() {
    const navigation = useNavigation<NavigationProp>();
    const today = useMemo(() => new Date(), []);

    const {
        data: schedules = [],
        isLoading,
        error,
    } = useQuery({
        queryKey: ["schedules", "today-schedule"],
        queryFn: async () => await scheduleService.getByDay(today),
    });

    if (!isLoading && schedules.length === 0) return null;

    return (
        <ColView className="gap-2">
            <RowView className="px-4 justify-between items-center">
                <Text className="text-lg font-medium">Today's Schedule</Text>
                <TouchableOpacity
                    onPress={() => navigation.navigate("Schedule")}
                >
                    <Text className=" text-primary">View All</Text>
                </TouchableOpacity>
            </RowView>

            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerClassName="px-4 gap-1"
            >
                {isLoading
                    ? Array.from({ length: 3 }).map((_, i) => (
                          <Card key={i} className="h-23 w-48" />
                      ))
                    : schedules &&
                      schedules.length > 0 &&
                      schedules.map((schedule) => {
                          const { id, time, title, description, type, goal } =
                              schedule;
                          const [h, m] = time.split(":").map(Number);

                          const scheduledDate = new Date();
                          scheduledDate.setHours(h, m, 0, 0);

                          const isPast = isBefore(
                              scheduledDate,
                              addMinutes(today, -60),
                          );
                          const goalKm = convertMtoKm(goal);

                          return (
                              <Card
                                  key={id}
                                  className={cn(isPast && "opacity-50")}
                              >
                                  <ColView>
                                      <RowView className="justify-between items-center gap-4">
                                          <Text
                                              className="text-wrap text-base font-medium"
                                              numberOfLines={1}
                                          >
                                              {title}
                                          </Text>
                                          <Text
                                              className="capitalize text-xs font-medium text-primary bg-muted px-1.5 py-0.5 rounded"
                                              style={{
                                                  color: ACTIVITY_TYPE_COLOR[
                                                      type as ActivityType
                                                  ],
                                              }}
                                          >
                                              {type}
                                          </Text>
                                      </RowView>
                                      <Divider className="hidden" />
                                      <RowView className="justify-between">
                                          <RowView className="items-center gap-1">
                                              <Icon
                                                  name="time"
                                                  size={12}
                                                  className="text-primary"
                                              />
                                              <Text className="text-xs text-muted-foreground">
                                                  {format(
                                                      scheduledDate,
                                                      "hh:mm a",
                                                  )}
                                              </Text>
                                          </RowView>
                                          <RowView className="items-center gap-1">
                                              <Icon
                                                  name="flag"
                                                  size={12}
                                                  className="text-primary"
                                              />
                                              <Text className="text-xs text-muted-foreground">
                                                  {goalKm.toFixed(1)} km
                                              </Text>
                                          </RowView>
                                      </RowView>
                                  </ColView>
                              </Card>
                          );
                      })}
            </ScrollView>
        </ColView>
    );
}
