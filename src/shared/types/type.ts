import { NativeStackNavigationProp } from "@react-navigation/native-stack";

export type RootStackParamList = {
    Main: undefined;
    Home: undefined;
    ActivityTracking: undefined;
    Settings: undefined;
    History: {
        initialFilter?:
            | "All"
            | "Today"
            | "This Week"
            | "This Month"
            | "All Time";
    };
    ActivityDetails: {
        activityId: string;
    };

    Profile: {
        screen?: "ProfileScreen" | "ProfileEdit";
    };
};
export type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
export type Location = {
    latitude: number;
    longitude: number;
    altitude: number | null;
    accuracy: number;
    timestamp: number;
    speed: number | null;
    heading: number | null;
};
export type ActivityTrackingStatus = "idle" | "active" | "paused";
export type ActivityType = "walk" | "run";

export type Coordinate = {
    latitude: number;
    longitude: number;
    altitude: number | null;
    timestamp: number;
    speed: number;
    accuracy: number;
    heading?: number | null;
};
export type Activity = {
    id: string;
    startTime: string;
    endTime: string;
    duration: number;
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
    gender: Gender;
    goal: number;
    createdAt?: string; // ISO 8601
    updatedAt?: string;
};

export type Gender = "male" | "female" | null;

export type ThemeMode = "light" | "dark" | "system";
export type UnitMode = "metric" | "imperial";
export type Settings = {
    preferences: {
        theme: ThemeMode;
        unit: UnitMode;
    };
};
