import { useEffect } from "react";
import { generateActivities } from "../lib/data";
import { useActivityStore } from "../stores/use-activity.store";

export const useActivity = () => {
    const setIsLoading = useActivityStore((s) => s.setIsLoading);
    const setError = useActivityStore((s) => s.setError);
    const setActivities = useActivityStore((s) => s.setActivities);
    useEffect(() => {
        const init = async () => {
            try {
                setIsLoading(true);
                const data = generateActivities();

                setActivities(data);

                setError(null);
            } catch (error) {
                console.log(error);
                setError(
                    error instanceof Error
                        ? error.message
                        : "Something went wrong",
                );
            } finally {
                setIsLoading(false);
            }
        };
        init();
    }, []);
};
