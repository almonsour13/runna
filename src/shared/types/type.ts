import { NativeStackNavigationProp } from "@react-navigation/native-stack";

export type RootStackParamList = {
    History: {
        initialFilter?:
            | "All"
            | "Today"
            | "This Week"
            | "This Month"
            | "All Time";
    };
};
export type NavigationProp = NativeStackNavigationProp<
    RootStackParamList,
    "History"
>;

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

export type Profile = {
    id?: string;
    name: string;
    height: number; // cm
    weight: number; // kg
    age: number; // years
    gender: Gender | null;
    createdAt?: string; // ISO 8601
    updatedAt?: string;
};

export type Gender = "male" | "female" | "other";
