import { Schedule } from "@/shared/types/type";
import { formatDurationHHMMSS } from "@/shared/utils/format";
import { logger } from "@/shared/utils/logger";
import * as Notifications from "expo-notifications";

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldPlaySound: false,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

const DAY_MAP: Record<number, Notifications.WeeklyTriggerInput["weekday"]> = {
    0: 1,
    1: 2,
    2: 3,
    3: 4,
    4: 5,
    5: 6,
    6: 7,
};

class NotificationService {
    async requestPermissions(): Promise<boolean> {
        logger.log("[Notification] requestPermissions → requesting...");
        const { status } = await Notifications.requestPermissionsAsync();
        if (status !== "granted") {
            logger.warn(
                `[Notification] requestPermissions → denied (status: ${status})`,
            );
            return false;
        }
        logger.log("[Notification] requestPermissions → granted");
        return true;
    }

    async scheduleActivityNotification(schedule: Schedule): Promise<void> {
        try {
            logger.log(
                `[Notification] scheduleNotification → start: "${schedule.title}" (id: ${schedule.id})`,
            );

            if (schedule.status !== "active" || !schedule.notificationEnabled)
                return;

            const repeatDays: number[] = schedule.repeatDays
                ? JSON.parse(schedule.repeatDays)
                : [];
            if (!repeatDays.length || !schedule.time) return;

            const [hour, minute] = schedule.time
                .split(":")
                .map((v) => parseInt(v));
            logger.log("[Notification] repeat days", repeatDays);

            for (const day of repeatDays) {
                const identifier = `${schedule.id}-${day}`;
                const weekday = DAY_MAP[day];

                await Notifications.scheduleNotificationAsync({
                    identifier,
                    content: {
                        title: schedule.title,
                        body: "Time for your scheduled activity!",
                    },
                    trigger: {
                        type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
                        weekday,
                        hour,
                        minute,
                    },
                });
            }

            logger.log(
                `[Notification] scheduleNotification → success: "${schedule.title}" (${repeatDays.length} days scheduled)`,
            );
        } catch (error) {
            logger.error(
                `[Notification] scheduleNotification → error for "${schedule.title}":`,
                error,
            );
        }
    }

    async cancelScheduleActivityNotification(
        scheduleId: string,
    ): Promise<void> {
        try {
            logger.log(
                `[Notification] cancelScheduleNotification → start: "${scheduleId}"`,
            );

            const scheduledNotifications =
                await Notifications.getAllScheduledNotificationsAsync();

            const notificationsToCancel = scheduledNotifications.filter(
                (notification) =>
                    notification.identifier.startsWith(scheduleId),
            );

            if (notificationsToCancel.length === 0) {
                logger.log(
                    `[Notification] cancelScheduleNotification → no notifications found for "${scheduleId}"`,
                );
                return;
            }

            await Promise.all(
                notificationsToCancel.map((notification) =>
                    Notifications.cancelScheduledNotificationAsync(
                        notification.identifier,
                    ),
                ),
            );

            logger.log(
                `[Notification] cancelScheduleNotification → success: cancelled ${notificationsToCancel.length} notification(s) for "${scheduleId}"`,
            );
        } catch (error) {
            logger.error(
                `[Notification] cancelScheduleNotification → error:`,
                error,
            );
        }
    }

    async cancelAllScheduleActivityNotifications(): Promise<void> {
        try {
            logger.log(`[Notification] cancelAllScheduleNotifications → start`);

            const scheduledNotifications =
                await Notifications.getAllScheduledNotificationsAsync();

            if (scheduledNotifications.length === 0) {
                logger.log(
                    `[Notification] cancelAllScheduleNotifications → no notifications to cancel`,
                );
                return;
            }

            await Promise.all(
                scheduledNotifications.map((notification) =>
                    Notifications.cancelScheduledNotificationAsync(
                        notification.identifier,
                    ),
                ),
            );

            logger.log(
                `[Notification] cancelAllScheduleNotifications → success: cancelled ${scheduledNotifications.length} notification(s)`,
            );
        } catch (error) {
            logger.error(
                `[Notification] cancelAllScheduleNotifications → error:`,
                error,
            );
        }
    }

    async getScheduledNotifications(): Promise<
        Notifications.NotificationRequest[]
    > {
        try {
            logger.log(
                `[Notification] getScheduledNotifications → fetching all scheduled notifications`,
            );
            const notifications =
                await Notifications.getAllScheduledNotificationsAsync();
            logger.log(
                `[Notification] getScheduledNotifications → found ${notifications.length} notification(s)`,
            );
            return notifications;
        } catch (error) {
            logger.error(
                `[Notification] getScheduledNotifications → error:`,
                error,
            );
            return [];
        }
    }

    async syncScheduleActivityNotification(schedule: Schedule): Promise<void> {
        try {
            logger.log(
                `[Notification] syncScheduleNotification → start: "${schedule.title}" (id: ${schedule.id})`,
            );

            await this.cancelScheduleActivityNotification(schedule.id);

            if (schedule.status === "active") {
                await this.scheduleActivityNotification(schedule);
            } else {
                logger.log(
                    `[Notification] syncScheduleNotification → skipped scheduling: status is "${schedule.status}"`,
                );
            }

            logger.log(
                `[Notification] syncScheduleNotification → success: "${schedule.title}"`,
            );
        } catch (error) {
            logger.error(
                `[Notification] syncScheduleNotification → error:`,
                error,
            );
        }
    }

    async updateActivityProgressNotification(
        activityId: string,
        duration: number,
        activityType: string = "Activity",
        distance?: number,
        pace?: string,
    ): Promise<void> {
        try {
            const durationFormatted = formatDurationHHMMSS(duration);

            let body = `Duration: ${durationFormatted}`;

            if (distance !== undefined) {
                body += ` • ${(distance / 1000).toFixed(2)} km`;
            }

            if (pace) {
                body += ` • ${pace}`;
            }

            const identifier = `activity-progress-${activityId}`;

            // remove previous visible notification
            await Notifications.dismissNotificationAsync(identifier);

            await Notifications.scheduleNotificationAsync({
                identifier,
                content: {
                    title: `${activityType} in progress`,
                    body,
                    sticky: true,
                    priority: Notifications.AndroidNotificationPriority.MAX,
                },
                trigger: null,
            });
        } catch (error) {
            logger.error(
                "[Notification] updateActivityProgressNotification → error:",
                error,
            );
        }
    }

    async cancelActivityProgressNotification(
        activityId: string,
    ): Promise<void> {
        try {
            const identifier = `activity-progress-${activityId}`;
            await Notifications.cancelScheduledNotificationAsync(identifier);

            logger.log(
                `[Notification] cancelActivityProgressNotification → cancelled for activity: "${activityId}"`,
            );
        } catch (error) {
            logger.error(
                `[Notification] cancelActivityProgressNotification → error:`,
                error,
            );
        }
    }
}

export const notificationService = new NotificationService();
