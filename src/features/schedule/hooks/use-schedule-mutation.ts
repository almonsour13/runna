import { scheduleService } from "@/shared/services/storage/schedule.service";
import { Schedule } from "@/shared/types/type";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useScheduleMutations = () => {
    const queryClient = useQueryClient();

    const invalidate = () =>
        queryClient.invalidateQueries({
            queryKey: ["schedules"],
            exact: false,
        });

    const createSchedule = useMutation({
        mutationFn: async (schedule: Schedule) =>
            await scheduleService.create(schedule),
        onSuccess: invalidate,
    });
    const updateSchedule = useMutation({
        mutationFn: async ({
            scheduleId,
            schedule,
        }: {
            scheduleId: string;
            schedule: Schedule;
        }) => await scheduleService.update(scheduleId, schedule),

        onSuccess: invalidate,
    });

    const deleteSchedule = useMutation({
        mutationFn: async (id: string) => await scheduleService.delete(id),
        onSuccess: invalidate,
    });

    return {
        createSchedule,
        updateSchedule,
        deleteSchedule,
        invalidate,
    };
};
