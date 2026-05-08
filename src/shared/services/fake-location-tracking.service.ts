import * as ExpoLocation from "expo-location";
import { logger } from "../utils/logger";
import { locationService } from "./location.service";

const ROUTE_DELTAS = [
    { dlat: 0.00005, dlng: 0.0001 },
    { dlat: 0.00008, dlng: 0.00008 },
    { dlat: 0.0001, dlng: 0.00003 },
    { dlat: 0.00007, dlng: -0.00002 },
    { dlat: 0.00005, dlng: -0.00008 },
    { dlat: 0.00002, dlng: -0.0001 },
    { dlat: -0.00003, dlng: -0.00007 },
    { dlat: -0.00007, dlng: 0.0 },
    { dlat: -0.00005, dlng: 0.00008 },
    { dlat: 0.0, dlng: 0.0001 },
];

type FakeMode = "preview" | "recording" | "stopped";

const TICK_INTERVAL_MS = 1000;

class FakeLocationTrackingService {
    private baseLatitude = 6.891719;
    private baseLongitude = 126.074069;

    private currentLat = this.baseLatitude;
    private currentLng = this.baseLongitude;

    private routeIndex = 0;
    private intervalId: ReturnType<typeof setInterval> | null = null;
    private mode: FakeMode = "stopped";

    // ======================
    // Controls
    // ======================

    /** Continuous low-frequency ticks for map display — no route progression */
    async startPreview(): Promise<void> {
        if (this.intervalId !== null) {
            logger.warn("[FakeLocation] Already running");
            return;
        }

        logger.log("[FakeLocation] Starting preview mode");
        this.mode = "preview";
        this.resetPosition();
        this.emitTick();

        this.intervalId = setInterval(() => this.emitTick(), TICK_INTERVAL_MS);
    }

    async stopPreview(): Promise<void> {
        this.clearInterval();
        this.mode = "stopped";
        logger.log("[FakeLocation] Preview stopped");
    }

    /** Full route tracking with jitter and speed */
    async start(): Promise<void> {
        if (this.intervalId !== null) {
            logger.warn("[FakeLocation] Already running");
            return;
        }

        logger.log("[FakeLocation] Starting recording mode");
        this.mode = "recording";
        this.resetPosition();
        this.emitTick();

        this.intervalId = setInterval(() => this.emitTick(), TICK_INTERVAL_MS);
    }

    async stop(): Promise<void> {
        this.clearInterval();
        this.mode = "stopped";
        this.resetPosition();
        logger.log("[FakeLocation] Recording stopped");
    }

    // ======================
    // Tick
    // ======================

    private emitTick(): void {
        const isRecording = this.mode === "recording";

        if (isRecording) {
            const delta = ROUTE_DELTAS[this.routeIndex % ROUTE_DELTAS.length];
            this.currentLat += delta.dlat + this.jitter();
            this.currentLng += delta.dlng + this.jitter();
            this.routeIndex++;
        }

        const delta = isRecording
            ? ROUTE_DELTAS[(this.routeIndex - 1) % ROUTE_DELTAS.length]
            : { dlat: 0, dlng: 0 };

        const fakeLocation: ExpoLocation.LocationObject = {
            coords: {
                latitude: this.currentLat,
                longitude: this.currentLng,
                altitude: 45.0,
                accuracy: isRecording
                    ? 4 + Math.random() * 3 // 4–7m realistic GPS
                    : 8 + Math.random() * 4, // 8–12m looser for preview
                altitudeAccuracy: 2.5,
                heading: this.bearing(delta.dlat, delta.dlng),
                speed: isRecording ? 2.8 + Math.random() * 0.4 : 0,
            },
            timestamp: Date.now(),
            mocked: true,
        };

        logger.log("[FakeLocation] Emitting", {
            mode: this.mode,
            lat: this.currentLat.toFixed(6),
            lng: this.currentLng.toFixed(6),
            tick: this.routeIndex,
        });

        locationService.emitBackgroundLocation(fakeLocation);
    }

    // ======================
    // Helpers
    // ======================

    private resetPosition(): void {
        this.currentLat = this.baseLatitude;
        this.currentLng = this.baseLongitude;
        this.routeIndex = 0;
    }

    private clearInterval(): void {
        if (this.intervalId !== null) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }

    private jitter(): number {
        return (Math.random() - 0.5) * 0.00001;
    }

    private bearing(dlat: number, dlng: number): number {
        const angle = Math.atan2(dlng, dlat) * (180 / Math.PI);
        return (angle + 360) % 360;
    }
}

export const fakeLocationTrackingService = new FakeLocationTrackingService();
