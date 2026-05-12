import Constants from "expo-constants";
import * as ExpoLocation from "expo-location";
import * as TaskManager from "expo-task-manager";
import {
    ACTIVITY_BACKGROUND_TASK,
    GPS_BACKGROUND_TRACKING_CONFIG,
    GPS_CONFIG,
} from "../../constant/constant";
import { Coordinate, Location } from "../../types/type";
import { KalmanFilter } from "../../utils/kalman-filter";
import { logger } from "../../utils/logger";
import { preprocessLocation } from "../../utils/preprocess-location";
import { registerBackgroundEmitter } from "../background/activity-background-tracking.service";
import { fakeLocationTrackingService } from "./fake-location-tracking.service";

type LocationCallback = (
    coord: Coordinate,
    label: string | null,
    mode: "preview" | "recording" | null,
) => void;
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
    private lastGeocodeTime = 0;

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
        this.lastCoord = null;

        if (IS_EXPO_GO) {
            await fakeLocationTrackingService.startPreview();
            return;
        }

        this.subscription = await ExpoLocation.watchPositionAsync(
            {
                accuracy: GPS_CONFIG.LOCATION_ACCURACY,
                timeInterval: GPS_CONFIG.LOCATION_TIME_INTERVAL_MS,
                distanceInterval: GPS_CONFIG.DISTANCE_INTERVAL_METERS,
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
        await this.requestPermissions();
        if (this.mode === "recording") {
            logger.warn("[Location] Already recording, ignoring start()");
            return;
        }

        this.kalman.reset();
        this.lastCoord = null;

        await this.stopPreview();

        this.mode = "recording";
        this.useBackgroundTracking = enableBackground;
        logger.log(
            `[Location] Start tracking (${IS_EXPO_GO ? "fake" : enableBackground ? "background" : "foreground"})`,
        );

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
                accuracy: GPS_CONFIG.LOCATION_ACCURACY,
                timeInterval: GPS_CONFIG.LOCATION_TIME_INTERVAL_MS,
                distanceInterval: GPS_CONFIG.DISTANCE_INTERVAL_METERS,
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

        await new Promise((resolve) => setTimeout(resolve, 500));

        const isRegistered = await TaskManager.isTaskRegisteredAsync(
            ACTIVITY_BACKGROUND_TASK,
        );

        if (isRegistered) {
            logger.log("[Location] Background tracking already running");
            return;
        }

        try {
            await ExpoLocation.startLocationUpdatesAsync(
                ACTIVITY_BACKGROUND_TASK,
                {
                    accuracy: GPS_CONFIG.LOCATION_ACCURACY,
                    distanceInterval: GPS_CONFIG.DISTANCE_INTERVAL_METERS,
                    timeInterval: GPS_CONFIG.LOCATION_TIME_INTERVAL_MS,
                    showsBackgroundLocationIndicator: true,
                    foregroundService: {
                        notificationTitle: "🏃 Running",
                        notificationBody: "Tracking your route...",
                        notificationColor: "#22c55e",
                        killServiceOnDestroy: false,
                    },
                    pausesUpdatesAutomatically: false,
                    deferredUpdatesInterval:
                        GPS_BACKGROUND_TRACKING_CONFIG.DEFERRED_UPDATES_INTERVAL,
                    deferredUpdatesDistance:
                        GPS_BACKGROUND_TRACKING_CONFIG.DEFERRED_UPDATES_DISTANCE,
                },
            );
            const isRegistered = await TaskManager.isTaskRegisteredAsync(
                ACTIVITY_BACKGROUND_TASK,
            );

            logger.log("[Location] isRegistered:", isRegistered);
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
    private async emitLocation(
        location: ExpoLocation.LocationObject,
        filter = true,
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

        if (this.mode === "preview") {
            const label = await this.tryReverseGeocodeThrottled(coord);

            logger.log("[Location] Preview emit", {
                lat: coord.latitude,
                lng: coord.longitude,
                accuracy: coord.accuracy,
                label,
            });

            this.locationUpdateCallbacks.forEach((cb) =>
                cb(coord, label, this.mode),
            );
            return;
        }

        // Recording
        const processedCoord = preprocessLocation(coord, this.lastCoord);

        if (!processedCoord) {
            logger.log("[Location] Recording coord dropped by filter", {
                lat: coord.latitude,
                lng: coord.longitude,
                accuracy: coord.accuracy,
                lastCoord: this.lastCoord,
            });
            return;
        }

        const label = await this.tryReverseGeocodeThrottled(processedCoord);
        this.lastCoord = processedCoord;
        logger.log("[Location] Recording emit", {
            lat: processedCoord.latitude,
            lng: processedCoord.longitude,
            accuracy: processedCoord.accuracy,
            label,
            totalCallbacks: this.locationUpdateCallbacks.length,
        });

        this.locationUpdateCallbacks.forEach((cb) =>
            cb(processedCoord, label, this.mode),
        );
    }
    private async tryReverseGeocodeThrottled(
        coord: Coordinate,
    ): Promise<string | null> {
        const now = Date.now();
        if (
            now - this.lastGeocodeTime <
            GPS_CONFIG.LOCATION_GEOCODE_INTERVAL_MS
        )
            return null;
        this.lastGeocodeTime = now;

        try {
            const results = await ExpoLocation.reverseGeocodeAsync({
                latitude: coord.latitude,
                longitude: coord.longitude,
            });
            if (!results?.length) return null;
            const top = results[0];
            const parts = [
                top.name || top.street,
                top.district || top.city,
            ].filter(Boolean);

            const label = parts.length > 0 ? parts.join(", ") : null;
            logger.log("[Location] Reverse geocode result", { label });
            return label;
        } catch (error) {
            logger.warn("[Location] Reverse geocode failed", { error });
            return null;
        }
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
