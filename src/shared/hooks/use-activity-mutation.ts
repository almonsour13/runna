import { useMutation, useQueryClient } from "@tanstack/react-query";
import { activityService } from "../services/storage/activity.service";

export const useActivityMutations = () => {
    const queryClient = useQueryClient();

    const invalidate = () =>
        Promise.all([
            queryClient.invalidateQueries({ queryKey: ["home"], exact: false }),
            queryClient.invalidateQueries({
                queryKey: ["history"],
                exact: false,
            }),
            queryClient.invalidateQueries({
                queryKey: ["statistics"],
                exact: false,
            }),
        ]);

    const deleteActivity = useMutation({
        mutationFn: (id: string) => activityService.delete(id),
        onSuccess: invalidate,
    });

    return {
        deleteActivity,
        invalidate,
    };
};
