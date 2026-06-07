import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ACTIVITY_TYPE } from "../constant/constant";
import { MapStyleName } from "../constant/map";
import { activity, coordinate } from "../db/schema";
import { schedule } from "../db/schema/schedule";

export type RootStackParamList = {
    Main: undefined;
    Home: undefined;
    Record: {
        type?: ActivityType;
    };
    Settings: undefined;
    Onboarding: {
        screen?: "OnboardingScreen" | "OnboardingSteps";
    };
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
        screen?: "ActivityDetailsScreen" | "ActivityDetailsShareCardScreen";
    };
    Profile: {
        screen?: "ProfileScreen" | "ProfileEdit";
    };
    Schedule: undefined;
};

export type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export type ThemeMode = "light" | "dark" | "system";

export type UnitMode = "kilometers" | "miles";

export type Gender = "male" | "female" | null;

export type RecordStatus = "idle" | "active" | "paused";
export type ActivityType = (typeof ACTIVITY_TYPE)[number];

export type Activity = typeof activity.$inferSelect;
export type Coordinate = typeof coordinate.$inferSelect;
export type ActivityWithCoordinates = Activity & {
    coordinates: Coordinate[];
};
export type RawCoordinate = Omit<Coordinate, "id" | "activityId">;
export type Schedule = typeof schedule.$inferSelect;

export type Profile = {
    id?: string;
    name: string;
    gender: Gender;
    age: number;
    height: number;
    weight: number;
    createdAt?: string;
    updatedAt?: string;
};

export type Preferences = {
    theme: ThemeMode;
    unit: UnitMode;
    goal: number;
    mapStyle: MapStyleName;
};

export type Settings = {
    preferences: Preferences;
};
