import { activityService } from "@/shared/services/storage/activity.service";
import { cn } from "@/shared/utils/cn";
import { computeStats } from "@/shared/utils/compute";
import { formatRelativeDateLabel, formatStats } from "@/shared/utils/format";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import ActivityCard from "../ActivityCard";
import { ColView, RowView } from "../CustomView";
import Icon from "../Icon";
import Card from "../ui/Card";
import Drawer, { DrawerHandle } from "../ui/Drawer";
import Text from "../ui/Text";

export type ActivityGroupDrawerHandle = DrawerHandle & {
    openWithActivityDate: (date: Date) => void;
};
const ActivityGroupDrawer = forwardRef<
    ActivityGroupDrawerHandle,
    {
        onClose?: () => void;
    }
>(({ onClose }, ref) => {
    const drawerRef = useRef<ActivityGroupDrawerHandle>(null);
    const [activityDate, setActivityDate] = useState<Date | null>(null);

    useImperativeHandle(ref, () => ({
        open: () => drawerRef.current?.open(),
        close: () => drawerRef.current?.close(),
        openWithActivityDate: (date: Date) => {
            drawerRef.current?.open();
            requestAnimationFrame(() => {
                setActivityDate(date);
            });
        },
    }));

    const { data: activities = [], isLoading } = useQuery({
        queryKey: ["activities", activityDate?.toDateString()],
        queryFn: async () => {
            if (!activityDate) return [];
            return activityService.getByDate(activityDate);
        },
        enabled: !!activityDate,
        staleTime: 0,
    });

    const isEmpty = !isLoading && activityDate && activities.length === 0;

    const dateLabel =
        activityDate &&
        [
            formatRelativeDateLabel(activityDate),
            format(activityDate, "EEE"),
            format(activityDate, "MMM d, yyy"),
        ]
            .filter(Boolean)
            .join(" • ");

    const { distance, calories, duration, goal, pace, speed } =
        computeStats(activities);
    const stats = formatStats({
        distance,
        duration,
        calories,
    });
    return (
        <>
            <Drawer ref={drawerRef}>
                {!isLoading && isEmpty ? (
                    <ColView className="items-center justify-center gap-3 px-4 py-16">
                        <Icon
                            name="footsteps-outline"
                            size={32}
                            className="text-muted-foreground"
                        />
                        <ColView className="items-center gap-1">
                            <Text className="text-sm font-medium">
                                No Activities
                            </Text>
                            <Text className="text-xs text-muted-foreground text-center">
                                Activities for this day will appear here.
                            </Text>
                        </ColView>
                    </ColView>
                ) : (
                    <ColView className="px-4 gap-2 py-4">
                        <RowView className="justify-between items-end">
                            <RowView className="gap-0">
                                <Text className="text-lg font-medium">
                                    {dateLabel}
                                </Text>
                            </RowView>
                            <Text className="text-base text-primary font-medium">
                                {activities.length}{" "}
                                {activities.length === 1
                                    ? "Activity"
                                    : "Activities"}
                            </Text>
                        </RowView>

                        <RowView className="justify-between gap-2">
                            {isLoading
                                ? Array.from({ length: 3 }).map((_, i) => (
                                      <Card
                                          key={i}
                                          className="flex-1 h-22 border border-border"
                                      />
                                  ))
                                : stats.map((stat, i) => (
                                      <Card
                                          key={stat.label}
                                          className={cn(
                                              "flex-1",
                                              "border border-border",
                                          )}
                                      >
                                          <ColView>
                                              <RowView>
                                                  <Icon
                                                      name={stat.icon}
                                                      size={11}
                                                      className="text-primary"
                                                  />
                                                  <Text className="text-xs text-muted-foreground">
                                                      {stat.label}
                                                  </Text>
                                              </RowView>
                                              <Text className={cn("text-xl")}>
                                                  {stat.value}{" "}
                                                  {stat.unit && (
                                                      <Text className="text-xs font-normal text-muted-foreground">
                                                          {stat.unit}
                                                      </Text>
                                                  )}
                                              </Text>
                                          </ColView>
                                      </Card>
                                  ))}
                        </RowView>
                        <ColView>
                            <Text className="text-lg font-medium">
                                Activities
                            </Text>
                            <ColView className="gap-2">
                                {isLoading
                                    ? Array.from({ length: 3 }).map((_, i) => (
                                          <Card
                                              key={i}
                                              className="h-22 border border-border"
                                          />
                                      ))
                                    : activities.map((activity) => (
                                          <ActivityCard
                                              key={activity.id}
                                              activity={activity}
                                              className="border border-border"
                                          />
                                      ))}
                            </ColView>
                        </ColView>
                    </ColView>
                )}
            </Drawer>
        </>
    );
});

export default ActivityGroupDrawer;
