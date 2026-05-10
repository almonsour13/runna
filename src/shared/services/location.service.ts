import Constants from "expo-constants";
import * as ExpoLocation from "expo-location";
import * as TaskManager from "expo-task-manager";
import {
    ACTIVITY_BACKGROUND_TASK,
    DISTANCE_INTERVAL_METERS,
    LOCATION_ACCURACY,
    LOCATION_TIME_INTERVAL_MS,
} from "../constant/constant";
import { Coordinate, Location } from "../types/type";
import { KalmanFilter } from "../utils/kalman-filter";
import { logger } from "../utils/logger";
import { preprocessLocation } from "../utils/preprocess-location";
import { registerBackgroundEmitter } from "./activity-background-tracking.service";
import { fakeLocationTrackingService } from "./fake-location-tracking.service";

type LocationCallback = (coord: Coordinate, label: string | null) => void;
type TrackingMode = "preview" | "recording";

// true when running inside Expo Go (appOwnership === "expo")
const IS_EXPO_GO = Constants.appOwnership === "expo";

class LocationService {
    private subscription: ExpoLocation.LocationSubscription | null = null;
    private locationUpdateCallbacks: LocationCallback[] = [];
    private mode: TrackingMode = "preview";
    private useBackgroundTracking = false;
    private kalman = new KalmanFilter();
    private lastCoord: Coordinate | null = null;

    constructor() {
        // Inject emitter into sub-services here — no circular imports needed
        fakeLocationTrackingService.setEmitter((loc) =>
            this.emitBackgroundLocation(loc),
        );
        registerBackgroundEmitter((loc) => this.emitBackgroundLocation(loc));
    }
    // ======================
    // Permissions
    // ======================
    async requestPermissions(): Promise<boolean> {
        // Expo Go can't request native permissions — skip
        if (IS_EXPO_GO) {
            logger.log("[Location] Expo Go detected — skipping permissions");
            return true;
        }

        const { status: fg } =
            await ExpoLocation.requestForegroundPermissionsAsync();

        if (fg !== "granted") {
            logger.warn("[Location] Foreground permission denied");
            return false;
        }

        const { status: bg } =
            await ExpoLocation.requestBackgroundPermissionsAsync();

        if (bg !== "granted") {
            logger.warn("[Location] Background permission denied");
            return false;
        }

        logger.log("[Location] Permissions granted (FG + BG)");
        return true;
    }

    // ======================
    // One-time location
    // ======================
    async getCurrentPosition(): Promise<Location | null> {
        logger.log("[Location] Getting current position");

        if (IS_EXPO_GO) {
            // Return the fake base position
            return {
                latitude: 6.891719,
                longitude: 126.074069,
                timestamp: Date.now(),
                altitude: 45.0,
                accuracy: 5,
                speed: 0,
                heading: 0,
            };
        }

        const location = await ExpoLocation.getCurrentPositionAsync({
            accuracy: ExpoLocation.Accuracy.BestForNavigation,
        });

        return {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            timestamp: location.timestamp,
            altitude: location.coords.altitude,
            accuracy: location.coords.accuracy ?? 999,
            speed: location.coords.speed,
            heading: location.coords.heading,
        };
    }

    // ======================
    // Preview Mode (UI only)
    // ======================
    async startPreview(): Promise<void> {
        logger.log("[Location] Start preview mode");
        this.mode = "preview";
        this.subscription?.remove();

        if (IS_EXPO_GO) {
            await fakeLocationTrackingService.startPreview();
            return;
        }

        this.subscription = await ExpoLocation.watchPositionAsync(
            {
                accuracy: ExpoLocation.Accuracy.BestForNavigation,
                timeInterval: 1000,
                distanceInterval: 0,
            },
            (location) => {
                this.emitLocation(location, true);
            },
        );
    }

    async stopPreview(): Promise<void> {
        logger.log("[Location] Stop preview mode");

        if (IS_EXPO_GO) {
            await fakeLocationTrackingService.stopPreview();
            return;
        }

        this.subscription?.remove();
        this.subscription = null;
    }

    // ======================
    // Start / Stop Tracking
    // ======================
    async start(enableBackground = true): Promise<void> {
        this.requestPermissions();
        if (this.mode === "recording") {
            logger.warn("[Location] Already recording, ignoring start()");
            return;
        }

        this.kalman.reset();
        this.lastCoord = null;
        logger.log(
            `[Location] Start tracking (${IS_EXPO_GO ? "fake" : enableBackground ? "background" : "foreground"})`,
        );

        if (this.mode === "preview") {
            logger.log("[Location] Switching preview → recording");
            this.subscription?.remove();
            this.subscription = null;

            if (IS_EXPO_GO) {
                await fakeLocationTrackingService.stopPreview();
            }
        }

        this.mode = "recording";
        this.useBackgroundTracking = enableBackground;

        if (IS_EXPO_GO) {
            await fakeLocationTrackingService.start();
            return;
        }

        if (enableBackground) {
            await this.stopForegroundTracking();
            await this.startBackgroundTracking();
        } else {
            await this.stopBackgroundTracking();
            await this.startForegroundTracking();
        }

        logger.log("[Location] State", {
            mode: this.mode,
            background: this.useBackgroundTracking,
        });
    }

    async stop(): Promise<void> {
        logger.log("[Location] Stop tracking");

        if (IS_EXPO_GO) {
            await fakeLocationTrackingService.stop();
        } else if (this.useBackgroundTracking) {
            await this.stopBackgroundTracking();
        } else {
            await this.stopForegroundTracking();
        }

        this.subscription?.remove();
        this.subscription = null;
        this.mode = "preview";
        this.kalman.reset();
        this.lastCoord = null;

        logger.log("[Location] Back to preview mode");
    }

    // ======================
    // Foreground Tracking
    // ======================
    private async startForegroundTracking(): Promise<void> {
        logger.log("[Location] Foreground tracking started");

        this.subscription = await ExpoLocation.watchPositionAsync(
            {
                accuracy: ExpoLocation.Accuracy.BestForNavigation,
                timeInterval: LOCATION_TIME_INTERVAL_MS,
                distanceInterval: DISTANCE_INTERVAL_METERS,
            },
            (location) => {
                this.emitLocation(location, true);
            },
        );
    }

    private async stopForegroundTracking(): Promise<void> {
        logger.log("[Location] Foreground tracking stopped");
        this.subscription?.remove();
        this.subscription = null;
    }

    // ======================
    // Background Tracking
    // ======================
    private async startBackgroundTracking(): Promise<void> {
        logger.log("[Location] Background tracking start requested");

        const isRegistered = await TaskManager.isTaskRegisteredAsync(
            ACTIVITY_BACKGROUND_TASK,
        );

        if (!isRegistered) {
            logger.error(
                "[Location] Task not registered — ensure activity-background-tracking.service " +
                    "is imported at the app entry point BEFORE any other imports.",
            );
            // Graceful fallback: use foreground tracking instead
            logger.warn("[Location] Falling back to foreground tracking");
            await this.startForegroundTracking();
            this.useBackgroundTracking = false;
            return;
        }

        try {
            await ExpoLocation.startLocationUpdatesAsync(
                ACTIVITY_BACKGROUND_TASK,
                {
                    accuracy: LOCATION_ACCURACY,
                    distanceInterval: DISTANCE_INTERVAL_METERS,
                    timeInterval: LOCATION_TIME_INTERVAL_MS,
                    showsBackgroundLocationIndicator: true,
                    foregroundService: {
                        notificationTitle: "🏃 Running",
                        notificationBody: "Tracking your route...",
                        notificationColor: "#22c55e",
                        killServiceOnDestroy: false,
                    },
                    pausesUpdatesAutomatically: false,
                },
            );

            logger.log("[Location] Background tracking started");
        } catch (error) {
            logger.error("[Location] Failed to start background tracking", {
                error,
            });
        }
    }

    private async stopBackgroundTracking(): Promise<void> {
        logger.log("[Location] Background tracking stop requested");

        const isRegistered = await TaskManager.isTaskRegisteredAsync(
            ACTIVITY_BACKGROUND_TASK,
        );

        if (!isRegistered) return;

        try {
            await ExpoLocation.stopLocationUpdatesAsync(
                ACTIVITY_BACKGROUND_TASK,
            );
            logger.log("[Location] Background tracking stopped");
        } catch (error) {
            logger.error("[Location] Failed to stop background tracking", {
                error,
            });
        }
    }

    // ======================
    // Shared emitter
    // ======================
    private emitLocation(
        location: ExpoLocation.LocationObject,
        filter = false,
    ) {
        const raw = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
        };

        const smoothed = filter
            ? this.kalman.update(
                  raw.latitude,
                  raw.longitude,
                  location.timestamp,
                  location.coords.accuracy ?? 10,
              )
            : raw;

        const coord: Coordinate = {
            latitude: smoothed.latitude,
            longitude: smoothed.longitude,
            timestamp: location.timestamp,
            speed: location.coords.speed ?? 0,
            accuracy: location.coords.accuracy ?? 999,
            altitude: location.coords.altitude,
            heading: location.coords.heading ?? null,
        };

        // Drop the point if it fails accuracy / speed / distance checks
        const processedCoord = preprocessLocation(coord, this.lastCoord);
        if (!processedCoord) return;

        this.lastCoord = processedCoord;
        this.locationUpdateCallbacks.forEach((cb) => cb(processedCoord, null));
    }

    emitBackgroundLocation(location: ExpoLocation.LocationObject): void {
        this.emitLocation(location, true);
    }

    // ======================
    // Listener
    // ======================
    onLocationUpdate(callback: LocationCallback): () => void {
        this.locationUpdateCallbacks.push(callback);

        return () => {
            this.locationUpdateCallbacks = this.locationUpdateCallbacks.filter(
                (cb) => cb !== callback,
            );
        };
    }
}

export const locationService = new LocationService();
