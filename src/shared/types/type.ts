import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { activity, coordinate } from "../db/schema";

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

export type ThemeMode = "light" | "dark" | "system";

export type UnitMode = "metric" | "imperial";

export type Gender = "male" | "female" | null;

export type ActivityTrackingStatus = "idle" | "active" | "paused";

export type ActivityType = "walk" | "run";

export type Activity = typeof activity.$inferSelect;
export type Coordinate = typeof coordinate.$inferSelect;
export type RawCoordinate = Omit<Coordinate, "id" | "activityId">;

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
