export type ActivityType = "walk" | "run";

export type Coordinate = {
    latitude: number;
    longitude: number;
    timestamp: number;
};
export type Activity = {
    id: string;
    startTime: string;
    endTime: string;
    duration: string;
    status: string;
    type: ActivityType;
    coordinates: Coordinate[];
    goal: number;
    createdAt: string;
    updatedAt: string;
};
