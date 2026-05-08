// utils/kalman-filter.ts

export class KalmanFilter {
    // Process noise — how much we trust the motion model.
    // Higher = follows GPS more aggressively; lower = smoother but laggier.
    private readonly Q = 3e-5;

    // Measurement noise — how much we distrust the raw GPS signal.
    // Higher = smoother; lower = more reactive to jumps.
    private readonly R = 0.01;

    private lat: number | null = null;
    private lng: number | null = null;

    // Error covariance per axis
    private pLat = 1;
    private pLng = 1;

    // Velocity in deg/ms (estimated from prior positions)
    private vLat = 0;
    private vLng = 0;

    private lastTimestamp: number | null = null;

    /**
     * Feed a raw GPS coordinate and get a smoothed one back.
     */
    update(
        rawLat: number,
        rawLng: number,
        timestamp: number,
        accuracy: number = 10,
    ): { latitude: number; longitude: number } {
        // First reading — initialise and return as-is
        if (
            this.lat === null ||
            this.lng === null ||
            this.lastTimestamp === null
        ) {
            this.lat = rawLat;
            this.lng = rawLng;
            this.lastTimestamp = timestamp;
            return { latitude: rawLat, longitude: rawLng };
        }

        const dt = Math.max(timestamp - this.lastTimestamp, 1); // ms, avoid div/0
        this.lastTimestamp = timestamp;

        // ── Predict ─────────────────────────────────────────────────────────
        // Extrapolate position using last known velocity
        const predictedLat = this.lat + this.vLat * dt;
        const predictedLng = this.lng + this.vLng * dt;

        // Grow uncertainty over time (process noise)
        this.pLat += this.Q;
        this.pLng += this.Q;

        // ── Update ──────────────────────────────────────────────────────────
        // Scale measurement noise by GPS accuracy (worse fix → trust less)
        const R = this.R * (accuracy / 5);

        // Kalman gain: how much to weight the new measurement vs the prediction
        const kLat = this.pLat / (this.pLat + R);
        const kLng = this.pLng / (this.pLng + R);

        // Blend prediction with measurement
        const smoothedLat = predictedLat + kLat * (rawLat - predictedLat);
        const smoothedLng = predictedLng + kLng * (rawLng - predictedLng);

        // Update velocity estimate (exponential smoothing to avoid jitter)
        const alpha = 0.3; // smoothing factor for velocity
        this.vLat =
            alpha * ((smoothedLat - this.lat) / dt) + (1 - alpha) * this.vLat;
        this.vLng =
            alpha * ((smoothedLng - this.lng) / dt) + (1 - alpha) * this.vLng;

        // Reduce uncertainty now that we have a measurement
        this.pLat = (1 - kLat) * this.pLat;
        this.pLng = (1 - kLng) * this.pLng;

        this.lat = smoothedLat;
        this.lng = smoothedLng;

        return { latitude: smoothedLat, longitude: smoothedLng };
    }

    /**
     * Reset when starting a new recording session.
     */
    reset(): void {
        this.lat = null;
        this.lng = null;
        this.pLat = 1;
        this.pLng = 1;
        this.vLat = 0;
        this.vLng = 0;
        this.lastTimestamp = null;
    }
}
