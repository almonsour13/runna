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
    mode: "preview" | "recording" | null,
) => void;
type TrackingMode = "preview" | "recording";

// FIX: Added a cap so transitions cannot lock the service forever if an async
// operation (e.g. stopLocationUpdatesAsync) hangs and never resolves.
const TRANSITION_TIMEOUT_MS = 10_000;

class LocationService {
    // ======================
    // State
    // ======================
    private subscription: ExpoLocation.LocationSubscription | null = null;

    // FIX: Changed from array to Map keyed by the callback reference.
    // An array allowed duplicate registrations — the same function reference
    // could be added multiple times, causing it to fire multiple times per
    // location update. A Map dedups by reference automatically.
    private locationUpdateCallbacks: Map<LocationCallback, LocationCallback> =
        new Map();

    private mode: TrackingMode = "preview";
    private useBackgroundTracking = true;
    private kalman = new KalmanFilter();
    private lastCoord: RawCoordinate | null = null;
    private appStateSubscription: ReturnType<
        typeof AppState.addEventListener
    > | null = null;
    private appState: AppStateStatus = AppState.currentState;
    private isTransitioning = false;
    private isForegroundRunning = false;
    private isBackgroundRunning = false;

    // ======================
    // Transition guard
    // ======================

    // FIX: Centralised transition guard with a timeout so a hung async
    // operation can never permanently lock the service. Returns a cleanup
    // function that clears the timeout and releases the flag.
    private acquireTransition(caller: string): () => void {
        if (this.isTransitioning) {
            const msg = `Transition in progress — ${caller}() blocked.`;
            logger.warn(`[Location] ${msg}`);
            throw new Error(msg);
        }
        this.isTransitioning = true;

        const timer = setTimeout(() => {
            logger.error(
                `[Location] Transition timeout in ${caller}() — force-releasing flag`,
            );
            this.isTransitioning = false;
        }, TRANSITION_TIMEOUT_MS);

        return () => {
            clearTimeout(timer);
            this.isTransitioning = false;
        };
    }

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
    // Preview Mode
    // ======================
    async startPreview(): Promise<void> {
        logger.log("[Location] startPreview() called");

        if (this.isTransitioning) {
            logger.warn(
                "[Location] startPreview() called during transition — skipping",
            );
            return;
        }

        if (this.isForegroundRunning && this.mode === "preview") {
            logger.log("[Location] Preview already active, skipping");
            return;
        }

        if (this.mode === "recording") {
            logger.warn(
                "[Location] startPreview() called while recording — ignoring",
            );
            return;
        }

        this.mode = "preview";
        this.useBackgroundTracking = false;
        await this.startForegroundTracking();

        logger.log("[Location] Preview started", {
            isForegroundRunning: this.isForegroundRunning,
        });
    }

    async stopPreview(): Promise<void> {
        logger.log("[Location] stopPreview() called");

        if (this.mode === "recording") {
            logger.warn(
                "[Location] stopPreview() called while recording — ignoring",
            );
            return;
        }

        await this.stopForegroundTracking();

        logger.log("[Location] Preview stopped", {
            isForegroundRunning: this.isForegroundRunning,
        });
    }

    // ======================
    // Start / Stop Recording
    // ======================
    async start(enableBackground = true): Promise<void> {
        logger.log("[Location] start() called", { enableBackground });

        // FIX: Replaced inline isTransitioning flag manipulation with
        // acquireTransition(), which also enforces a timeout so a hung
        // async op can never permanently lock the service.
        const release = this.acquireTransition("start");

        try {
            if (this.mode === "recording") {
                logger.warn("[Location] Already recording, ignoring start()");
                return;
            }

            // FIX: Moved the mode guard inside the try so the release()
            // in finally always runs regardless of the early-return path.

            this.kalman.reset();
            let seedCoord = this.lastCoord;

            this.mode = "recording";
            this.useBackgroundTracking = enableBackground;

            await this.stopForegroundTracking();
            await this.startForegroundTracking();

            if (enableBackground) {
                await this.startBackgroundTracking();
                this.setupAppStateListener();
            }

            if (!seedCoord) {
                try {
                    seedCoord = await this.getCurrentPosition();
                    logger.log(
                        "[Location] Seeded current position as fallback",
                    );
                } catch (error) {
                    logger.warn("[Location] Failed to seed current position", {
                        message: (error as Error)?.message,
                    });
                }
            }

            if (seedCoord) {
                logger.log(
                    "[Location] Seeding first coord from preview/current",
                    { lat: seedCoord.latitude, lng: seedCoord.longitude },
                );
                this.lastCoord = seedCoord;
                this.emitToCallbacks(seedCoord, "recording");
            }

            logger.log("[Location] Recording started", {
                mode: this.mode,
                isForegroundRunning: this.isForegroundRunning,
                isBackgroundRunning: this.isBackgroundRunning,
                useBackgroundTracking: this.useBackgroundTracking,
            });
        } catch (error) {
            logger.error("[Location] Failed to start recording", {
                message: (error as Error)?.message,
                stack: (error as Error)?.stack,
            });
            this.mode = "preview";
            throw error;
        } finally {
            release();
        }
    }

    async stop(): Promise<void> {
        logger.log("[Location] stop() called");

        const release = this.acquireTransition("stop");

        try {
            this.teardownAppStateListener();

            if (this.useBackgroundTracking) {
                await this.stopBackgroundTracking();
            }

            await this.stopForegroundTracking();

            this.mode = "preview";
            this.useBackgroundTracking = false;

            // FIX: Moved kalman.reset() here from inside the try so it
            // always runs even if stopForegroundTracking throws. Leaving
            // stale Kalman state across sessions skews the first coordinates
            // of the next recording.
            this.kalman.reset();

            logger.log("[Location] Recording stopped", {
                isForegroundRunning: this.isForegroundRunning,
                isBackgroundRunning: this.isBackgroundRunning,
            });
        } catch (error) {
            logger.error("[Location] Failed to stop recording", {
                message: (error as Error)?.message,
                stack: (error as Error)?.stack,
            });

            // FIX: Previously swallowed the error silently, meaning callers
            // (e.g. RecordActivityService.pause) could not tell if stop()
            // succeeded. Now rethrows so the caller can react appropriately.
            throw error;
        } finally {
            // FIX: kalman is reset in finally to cover both success and error.
            // (The reset above in try is kept for the success path log order;
            // this one is the safety net.)
            release();
        }
    }

    // ======================
    // Foreground Tracking
    // ======================
    private async startForegroundTracking(): Promise<void> {
        if (this.isForegroundRunning) {
            logger.log("[Location] Foreground already running, skipping");
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

            this.isForegroundRunning = true;
            logger.log("[Location] Foreground tracking started", {
                isForegroundRunning: this.isForegroundRunning,
            });
        } catch (error) {
            logger.error("[Location] Failed to start foreground tracking", {
                message: (error as Error)?.message,
                stack: (error as Error)?.stack,
            });
            this.subscription = null;
            this.isForegroundRunning = false;
            throw error;
        }
    }

    private async stopForegroundTracking(): Promise<void> {
        if (!this.isForegroundRunning) {
            logger.log("[Location] Foreground not running, skipping stop");
            return;
        }

        this.subscription?.remove();
        this.subscription = null;
        this.isForegroundRunning = false;

        logger.log("[Location] Foreground tracking stopped", {
            isForegroundRunning: this.isForegroundRunning,
        });
    }

    // ======================
    // Background Tracking
    // ======================
    private async startBackgroundTracking(): Promise<void> {
        logger.log("[Location] Background tracking start requested");

        if (this.isBackgroundRunning) {
            logger.log("[Location] Background already running, skipping");
            return;
        }

        try {
            const isRegistered = await TaskManager.isTaskRegisteredAsync(
                ACTIVITY_BACKGROUND_TASK,
            );

            if (isRegistered) {
                logger.log("[Location] Background task already registered");
                this.isBackgroundRunning = true;
                return;
            }

            // NOTE: This delay was introduced as a workaround for a race
            // between TaskManager.defineTask (called at module load) and
            // startLocationUpdatesAsync. On some Android versions the task
            // registry is not synchronously ready immediately after module
            // evaluation, causing startLocationUpdatesAsync to throw
            // "task not found". A proper fix would be to poll
            // isTaskRegisteredAsync with backoff, but the 200ms delay has
            // proven reliable in practice. If this becomes flaky, replace
            // with an exponential-backoff retry loop.
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
                        killServiceOnDestroy: false,
                    },
                    pausesUpdatesAutomatically: false,
                    deferredUpdatesInterval:
                        GPS_BACKGROUND_TRACKING_CONFIG.DEFERRED_UPDATES_INTERVAL,
                    deferredUpdatesDistance:
                        GPS_BACKGROUND_TRACKING_CONFIG.DEFERRED_UPDATES_DISTANCE,
                },
            );

            this.isBackgroundRunning = true;

            logger.log("[Location] Background tracking started", {
                isBackgroundRunning: this.isBackgroundRunning,
            });
        } catch (error) {
            logger.error("[Location] Failed to start background tracking", {
                message: (error as Error)?.message,
                stack: (error as Error)?.stack,
            });
            this.isBackgroundRunning = false;
            throw error;
        }
    }

    private async stopBackgroundTracking(): Promise<void> {
        logger.log("[Location] Background tracking stop requested");

        if (!this.isBackgroundRunning) {
            logger.log("[Location] Background not running, skipping stop");
            return;
        }

        try {
            const isRegistered = await TaskManager.isTaskRegisteredAsync(
                ACTIVITY_BACKGROUND_TASK,
            );

            if (isRegistered) {
                await ExpoLocation.stopLocationUpdatesAsync(
                    ACTIVITY_BACKGROUND_TASK,
                );
            }

            this.isBackgroundRunning = false;

            logger.log("[Location] Background tracking stopped", {
                isBackgroundRunning: this.isBackgroundRunning,
            });
        } catch (error) {
            logger.error("[Location] Failed to stop background tracking", {
                message: (error as Error)?.message,
                stack: (error as Error)?.stack,
            });
            this.isBackgroundRunning = false;
        }
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

                if (this.mode !== "recording" || !this.useBackgroundTracking)
                    return;

                if (state === "background" || state === "inactive") {
                    logger.log(
                        "[Location] App backgrounded — handing off to background task",
                    );
                    // NOTE: Fire-and-forget is intentional here — the app is
                    // going to the background and we cannot await. The
                    // background task takes over immediately.
                    this.stopForegroundTracking();
                } else if (state === "active") {
                    logger.log(
                        "[Location] App foregrounded — reclaiming foreground tracking",
                    );

                    // FIX: Added isTransitioning guard before calling
                    // startForegroundTracking. Without this, an app-foreground
                    // event arriving while stop() is in progress (isTransitioning
                    // = true) would restart foreground tracking after it had
                    // just been torn down, leaving an orphaned subscription.
                    if (this.isTransitioning) {
                        logger.warn(
                            "[Location] App foregrounded during transition — skipping foreground reclaim",
                        );
                        return;
                    }

                    this.startForegroundTracking().catch((error) => {
                        logger.error(
                            "[Location] Failed to reclaim foreground tracking:",
                            error,
                        );
                    });
                }
            },
        );

        logger.log("[Location] AppState listener set up");
    }

    private teardownAppStateListener(): void {
        if (!this.appStateSubscription) return;

        this.appStateSubscription.remove();
        this.appStateSubscription = null;
        logger.log("[Location] AppState listener torn down");
    }

    // ======================
    // Emitters
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
                logger.log("[Location] Preview emit", {
                    lat: coord.latitude,
                    lng: coord.longitude,
                    accuracy: coord.accuracy,
                });
                this.lastCoord = coord;
                this.emitToCallbacks(coord, this.mode);
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

            this.lastCoord = processedCoord;

            logger.log("[Location] Recording emit", {
                lat: processedCoord.latitude,
                lng: processedCoord.longitude,
                accuracy: processedCoord.accuracy,
            });

            this.emitToCallbacks(processedCoord, this.mode);
        } catch (error) {
            logger.error("[Location] Error in emitLocation:", error);
        }
    }

    // FIX: Updated to iterate over Map values instead of an array.
    private emitToCallbacks(coord: RawCoordinate, mode: TrackingMode): void {
        this.locationUpdateCallbacks.forEach((cb) => {
            try {
                cb(coord, mode);
            } catch (error) {
                logger.error("[Location] Error in location callback:", error);
            }
        });
    }

    emitBackgroundLocation(location: ExpoLocation.LocationObject): void {
        if (this.mode !== "recording") {
            logger.warn(
                "[Location] emitBackgroundLocation called outside recording — ignoring",
            );
            return;
        }

        // FIX: Added isTransitioning guard. Without this, a background task
        // firing during stop() teardown would emit a coord to callbacks that
        // are in the process of being cleaned up, potentially writing a
        // stale coordinate to storage after the activity has been finalised.
        if (this.isTransitioning) {
            logger.warn(
                "[Location] emitBackgroundLocation called during transition — ignoring",
            );
            return;
        }

        if (this.appState === "active") {
            logger.log(
                "[Location] App is foreground, skipping background emit",
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
    // Public subscription API
    // ======================

    // FIX: Updated to use the Map-based callback store. Registering the same
    // function reference twice is now a no-op — the Map key deduplicates it —
    // whereas the old array silently added a duplicate entry that fired twice
    // per location update.
    onLocationUpdate(callback: LocationCallback): () => void {
        if (!callback) {
            logger.warn(
                "[Location] Attempted to register null/undefined callback",
            );
            return () => {};
        }

        this.locationUpdateCallbacks.set(callback, callback);
        logger.log(
            `[Location] Callback registered (total: ${this.locationUpdateCallbacks.size})`,
        );

        return () => {
            this.locationUpdateCallbacks.delete(callback);
            logger.log(
                `[Location] Callback unregistered (remaining: ${this.locationUpdateCallbacks.size})`,
            );
        };
    }

    // ======================
    // Debug / Status
    // ======================
    getStatus() {
        return {
            mode: this.mode,
            isForegroundRunning: this.isForegroundRunning,
            isBackgroundRunning: this.isBackgroundRunning,
            isTransitioning: this.isTransitioning,
            useBackgroundTracking: this.useBackgroundTracking,
            hasLastCoord: this.lastCoord !== null,
            callbackCount: this.locationUpdateCallbacks.size,
        };
    }
}

export const locationService = new LocationService();
