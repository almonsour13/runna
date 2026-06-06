import { activityService } from "@/shared/services/storage/activity.service";
import { Activity } from "@/shared/types/type";
import { useQuery } from "@tanstack/react-query";
import {
    addMonths,
    addWeeks,
    addYears,
    endOfMonth,
    endOfWeek,
    endOfYear,
    format,
    isThisMonth,
    isThisWeek,
    isThisYear,
    startOfMonth,
    startOfWeek,
    startOfYear,
} from "date-fns";
import { createContext, useContext, useMemo, useState } from "react";

export const TABS = ["Week", "Month", "Year", "All Time"] as const;

type StatisticContextType = {
    activeTab: (typeof TABS)[number];
    setActiveTab: (tab: (typeof TABS)[number]) => void;
    dateRange: {
        from: Date | null;
        to: Date | null;
    };
    rangeLabel: string;
    offset: number;
    setOffset: React.Dispatch<React.SetStateAction<number>>;
    activities: Activity[];
    isLoading: boolean;
};

const StatisticContext = createContext<StatisticContextType | null>(null);

export const StatisticProvider = ({
    children,
}: {
    children: React.ReactNode;
}) => {
    const [activeTab, setActiveTab] = useState<(typeof TABS)[number]>("Week");
    const [offset, setOffset] = useState(0);

    const dateRange = useMemo(() => {
        const today = new Date();

        if (activeTab === "Week") {
            const base = addWeeks(
                startOfWeek(today, { weekStartsOn: 0 }),
                offset,
            );
            return {
                from: base,
                to: endOfWeek(base, { weekStartsOn: 0 }),
            };
        }

        if (activeTab === "Month") {
            const base = addMonths(startOfMonth(today), offset);
            return {
                from: base,
                to: endOfMonth(base),
            };
        }

        if (activeTab === "Year") {
            const base = addYears(startOfYear(today), offset);
            return { from: base, to: endOfYear(base) };
        }

        return { from: null, to: null };
    }, [activeTab, offset]);

    const rangeLabel = useMemo(() => {
        if (activeTab === "All Time") return "All Time";
        if (activeTab === "Week") {
            if (isThisWeek(dateRange.from!, { weekStartsOn: 0 }))
                return "This Week";
            return `${format(dateRange.from!, "MMM d")} – ${format(dateRange.to!, "MMM d")}`;
        }
        if (activeTab === "Month") {
            if (isThisMonth(dateRange.from!)) return "This Month";
            return format(dateRange.from!, "MMMM yyyy");
        }
        if (activeTab === "Year") {
            if (isThisYear(dateRange.from!)) return "This Year";
            return format(dateRange.from!, "yyyy");
        }
        return "";
    }, [activeTab, dateRange]);

    const { data: activities = [], isLoading } = useQuery({
        queryKey: ["statistics", activeTab, offset],
        queryFn: () =>
            activeTab === "All Time"
                ? activityService.get({})
                : activityService.getByDateRange(
                      dateRange.from!,
                      dateRange.to!,
                  ),
        staleTime: 1000 * 60 * 5,
    });

    const handleSetActiveTab = (tab: (typeof TABS)[number]) => {
        setActiveTab(tab);
        setOffset(0);
    };

    return (
        <StatisticContext.Provider
            value={{
                activeTab,
                setActiveTab: handleSetActiveTab,
                offset,
                dateRange,
                rangeLabel,
                setOffset,
                activities,
                isLoading,
            }}
        >
            {children}
        </StatisticContext.Provider>
    );
};

export const useStatisticContext = () => {
    const context = useContext(StatisticContext);
    if (!context) {
        throw new Error(
            "useStatisticContext must be used within a StatisticProvider",
        );
    }
    return context;
};
