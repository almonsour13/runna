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
        activityId: number;
    };

    Profile: {
        screen?: "ProfileScreen" | "ProfileEdit";
    };
};

export type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export type ThemeMode = "light" | "dark" | "system";

export type UnitMode = "metric" | "imperial";

export type Gender = "male" | "female" | null;

export type Location = {
    latitude: number;
    longitude: number;
    altitude: number | null;
    accuracy: number;
    timestamp: number;
    speed: number | null;
    heading: number | null;
};

export type Coordinate = {
    latitude: number;
    longitude: number;
    altitude: number | null;
    accuracy: number;
    timestamp: number;
    speed: number;
    heading?: number | null;
};

export type ActivityTrackingStatus = "idle" | "active" | "paused";

export type ActivityType = "walk" | "run";

export type Activity = {
    id: number;
    type: string;
    status: string;
    duration: number;
    goal: number;
    startTime: string;
    endTime: string;
    coordinates?: Coordinate[];
    createdAt: Date;
    updatedAt: Date;
};

export type Profile = {
    id?: string;
    name: string;
    gender: Gender;
    age: number;
    height: number;
    weight: number;
    goal: number;
    createdAt?: string;
    updatedAt?: string;
};

export type Preferences = {
    theme: ThemeMode;
    unit: UnitMode;
};

export type Settings = {
    preferences: Preferences;
};
