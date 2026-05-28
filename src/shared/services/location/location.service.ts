import * as ExpoLocation from "expo-location";
import * as TaskManager from "expo-task-manager";
import { AppState, AppStateStatus } from "react-native";
import {
    ACTIVITY_BACKGROUND_TASK,
    GPS_BACKGROUND_TRACKING_CONFIG,
    GPS_CONFIG,
} from "../../constant/constant";
import { RawCoordinate } from "../../types/type";
import { KalmanFilter } from "../../utils/kalman-filter";
import { logger } from "../../utils/logger";
import { preprocessLocation } from "../../utils/preprocess-location";

type LocationCallback = (
    coord: RawCoordinate,
    label: string | null,
    mode: "preview" | "recording" | null,
) => void;
type TrackingMode = "preview" | "recording";

class LocationService {
    private subscription: ExpoLocation.LocationSubscription | null = null;
    private locationUpdateCallbacks: LocationCallback[] = [];
    private mode: TrackingMode = "preview";
    private useBackgroundTracking = false;
    private kalman = new KalmanFilter();
    private lastCoord: RawCoordinate | null = null;
    private lastGeocodeTime = 0;
    private appStateSubscription: ReturnType<
        typeof AppState.addEventListener
    > | null = null;
    private appState: AppStateStatus = AppState.currentState;
    private isTransitioning = false;

    // ======================
    // Permissions
    // ======================
    async requestPermissions(): Promise<boolean> {
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
    async getCurrentPosition(): Promise<RawCoordinate | null> {
        logger.log("[Location] Getting current position");

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

        if (this.subscription && this.mode === "preview") {
            logger.log("[Location] Preview already active, skipping");
            return;
        }

        this.mode = "preview";
        this.subscription?.remove();
        this.subscription = null;
        this.lastCoord = null;

        try {
            this.subscription = await ExpoLocation.watchPositionAsync(
                {
                    accuracy: GPS_CONFIG.LOCATION_ACCURACY,
                    timeInterval: GPS_CONFIG.LOCATION_TIME_INTERVAL_MS,
                    distanceInterval: GPS_CONFIG.DISTANCE_INTERVAL_METERS,
                },
                (location) => {
                    this.emitLocation(location, true).catch((error) => {
                        logger.error(
                            "[Location] Error emitting location:",
                            error,
                        );
                    });
                },
            );
            logger.log("[Location] Preview mode started successfully");
        } catch (error) {
            logger.error("[Location] Failed to start preview", {
                message: (error as Error)?.message,
                stack: (error as Error)?.stack,
            });
            this.subscription = null;
            throw error;
        }
    }

    async stopPreview(): Promise<void> {
        logger.log("[Location] Stop preview mode");
        this.subscription?.remove();
        this.subscription = null;
    }

    // ======================
    // AppState Listener
    // ======================
    private setupAppStateListener(): void {
        this.teardownAppStateListener();

        this.appStateSubscription = AppState.addEventListener(
            "change",
            (state: AppStateStatus) => {
                this.appState = state;

                if (this.mode !== "recording" || !this.useBackgroundTracking) {
                    return;
                }

                if (state === "background" || state === "inactive") {
                    logger.log(
                        "[Location] App went background — stopping foreground tracking, background task takes over",
                    );
                    this.stopForegroundTracking();
                } else if (state === "active") {
                    logger.log(
                        "[Location] App came foreground — reclaiming high-accuracy foreground tracking",
                    );
                    this.startForegroundTracking();
                }
            },
        );

        logger.log("[Location] AppState listener set up");
    }

    private teardownAppStateListener(): void {
        if (this.appStateSubscription) {
            this.appStateSubscription.remove();
            this.appStateSubscription = null;
            logger.log("[Location] AppState listener torn down");
        }
    }

    // ======================
    // Start / Stop Tracking
    // ======================
    async start(enableBackground = true): Promise<void> {
        // FIX: Throw instead of silently returning when a transition is in
        // progress. The caller (RecordActivityService.startLocationListener)
        // needs to know GPS did NOT start so it can log/handle it, rather
        // than assuming tracking is active when it isn't.
        if (this.isTransitioning) {
            const msg =
                "Transition in progress — start() blocked. GPS is not tracking.";
            logger.warn(`[Location] ${msg}`);
            throw new Error(msg);
        }
        if (this.mode === "recording") {
            logger.warn("[Location] Already recording, ignoring start()");
            return;
        }

        this.isTransitioning = true;
        try {
            this.kalman.reset();
            const seedCoord = this.lastCoord;

            await this.stopPreview();

            this.mode = "recording";
            this.useBackgroundTracking = enableBackground;
            logger.log(
                `[Location] Start tracking (${enableBackground ? "background" : "foreground"})`,
            );

            await this.startForegroundTracking();

            if (enableBackground) {
                await this.startBackgroundTracking();
                this.setupAppStateListener();
            }

            if (seedCoord) {
                logger.log(
                    "[Location] Seeding first recording coord from preview",
                    {
                        lat: seedCoord.latitude,
                        lng: seedCoord.longitude,
                    },
                );
                this.lastCoord = seedCoord;
                this.locationUpdateCallbacks.forEach((cb) =>
                    cb(seedCoord, null, "recording"),
                );
            }

            logger.log("[Location] State", {
                mode: this.mode,
                background: this.useBackgroundTracking,
            });
        } catch (error) {
            logger.error("[Location] Failed to start tracking", {
                message: (error as Error)?.message,
                stack: (error as Error)?.stack,
            });
            // Roll back mode on failure
            this.mode = "preview";
            throw error;
        } finally {
            this.isTransitioning = false;
        }
    }

    async stop(): Promise<void> {
        // FIX: Throw instead of silently returning when a transition is in
        // progress, for the same reason as start() — callers need to know
        // whether stop actually completed, especially RecordActivityService
        // which awaits stopLocationListener() before starting a new session.
        if (this.isTransitioning) {
            const msg =
                "Transition in progress — stop() blocked. Subscription may still be active.";
            logger.warn(`[Location] ${msg}`);
            throw new Error(msg);
        }

        this.isTransitioning = true;
        try {
            logger.log("[Location] Stop tracking");

            // Cleanup in order: AppState listener → foreground → background
            this.teardownAppStateListener();
            await this.stopForegroundTracking();

            if (this.useBackgroundTracking) {
                await this.stopBackgroundTracking();
            }

            // Clean up subscriptions and state
            this.subscription?.remove();
            this.subscription = null;
            this.mode = "preview";
            this.useBackgroundTracking = false;
            this.kalman.reset();
            this.lastCoord = null;

            logger.log("[Location] Tracking stopped successfully");
        } catch (error) {
            logger.error("[Location] Failed to stop tracking", {
                message: (error as Error)?.message,
                stack: (error as Error)?.stack,
            });
            // Don't re-throw to prevent cascading failures in callers
            logger.error("[Location] Recovered from stop error");
        } finally {
            this.isTransitioning = false;
        }
    }

    // ======================
    // Foreground Tracking
    // ======================
    private async startForegroundTracking(): Promise<void> {
        if (this.subscription) {
            logger.log(
                "[Location] Foreground subscription already active, skipping",
            );
            return;
        }

        try {
            logger.log("[Location] Foreground tracking starting");

            this.subscription = await ExpoLocation.watchPositionAsync(
                {
                    accuracy: GPS_CONFIG.LOCATION_ACCURACY,
                    timeInterval: GPS_CONFIG.LOCATION_TIME_INTERVAL_MS,
                    distanceInterval: GPS_CONFIG.DISTANCE_INTERVAL_METERS,
                },
                (location) => {
                    this.emitLocation(location, true).catch((error) => {
                        logger.error(
                            "[Location] Error emitting foreground location:",
                            error,
                        );
                    });
                },
            );
            logger.log("[Location] Foreground tracking started successfully");
        } catch (error) {
            logger.error("[Location] Failed to start foreground tracking", {
                message: (error as Error)?.message,
                stack: (error as Error)?.stack,
            });
            this.subscription = null;
            throw error;
        }
    }

    private async stopForegroundTracking(): Promise<void> {
        if (!this.subscription) return;
        logger.log("[Location] Foreground tracking stopped");
        this.subscription.remove();
        this.subscription = null;
    }

    // ======================
    // Background Tracking
    // ======================
    private async startBackgroundTracking(): Promise<void> {
        logger.log("[Location] Background tracking start requested");

        try {
            const isRegistered = await TaskManager.isTaskRegisteredAsync(
                ACTIVITY_BACKGROUND_TASK,
            );

            if (isRegistered) {
                logger.log("[Location] Background tracking already running");
                return;
            }

            // Small delay to allow foreground tracking to settle
            await new Promise((resolve) => setTimeout(resolve, 200));

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

            const isRegisteredNow = await TaskManager.isTaskRegisteredAsync(
                ACTIVITY_BACKGROUND_TASK,
            );
            logger.log(
                "[Location] Background tracking registered:",
                isRegisteredNow,
            );
            logger.log("[Location] Background tracking started successfully");
        } catch (error) {
            logger.error("[Location] Failed to start background tracking", {
                message: (error as Error)?.message,
                stack: (error as Error)?.stack,
            });
            throw error;
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
                message: (error as Error)?.message,
                stack: (error as Error)?.stack,
            });
            // don't re-throw — stopping should always succeed from caller's perspective
        }
    }

    // ======================
    // Shared emitter
    // ======================
    private async emitLocation(
        location: ExpoLocation.LocationObject,
        filter = true,
    ): Promise<void> {
        try {
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

            const coord: RawCoordinate = {
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
                });

                this.lastCoord = coord;
                this.emitLocationToCallbacks(coord, label, this.mode);
                return;
            }

            const processedCoord = preprocessLocation(coord, this.lastCoord);

            if (!processedCoord) {
                logger.log("[Location] Coord dropped by filter", {
                    lat: coord.latitude,
                    lng: coord.longitude,
                    accuracy: coord.accuracy,
                });
                return;
            }

            const label = await this.tryReverseGeocodeThrottled(processedCoord);
            this.lastCoord = processedCoord;

            logger.log("[Location] Recording emit", {
                lat: processedCoord.latitude,
                lng: processedCoord.longitude,
                accuracy: processedCoord.accuracy,
            });

            this.emitLocationToCallbacks(processedCoord, label, this.mode);
        } catch (error) {
            logger.error("[Location] Error in emitLocation:", error);
        }
    }

    private emitLocationToCallbacks(
        coord: RawCoordinate,
        label: string | null,
        mode: TrackingMode,
    ): void {
        // Ensure all callbacks are executed even if one throws
        this.locationUpdateCallbacks.forEach((cb) => {
            try {
                cb(coord, label, mode);
            } catch (error) {
                logger.error("[Location] Error in location callback:", error);
            }
        });
    }

    private async tryReverseGeocodeThrottled(
        coord: RawCoordinate,
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
        if (this.mode !== "recording") {
            logger.warn(
                "[Location] emitBackgroundLocation called outside recording mode — ignoring",
            );
            return;
        }

        if (this.appState === "active") {
            logger.log(
                "[Location] App is foreground, skipping background location emit",
            );
            return;
        }

        this.emitLocation(location, true).catch((error) => {
            logger.error(
                "[Location] Error emitting background location:",
                error,
            );
        });
    }

    // ======================
    // Listener
    // ======================
    onLocationUpdate(callback: LocationCallback): () => void {
        if (!callback) {
            logger.warn(
                "[Location] Attempted to register null/undefined callback",
            );
            return () => {};
        }

        this.locationUpdateCallbacks.push(callback);
        logger.log(
            `[Location] Callback registered (total: ${this.locationUpdateCallbacks.length})`,
        );

        return () => {
            const initialLength = this.locationUpdateCallbacks.length;
            this.locationUpdateCallbacks = this.locationUpdateCallbacks.filter(
                (cb) => cb !== callback,
            );
            if (this.locationUpdateCallbacks.length < initialLength) {
                logger.log(
                    `[Location] Callback unregistered (remaining: ${this.locationUpdateCallbacks.length})`,
                );
            }
        };
    }
}

export const locationService = new LocationService();
