// utils/kalman-filter.ts

export class KalmanFilter {
    private readonly Q = 1e-4;
    private readonly R = 0.05;

    private lat: number | null = null;
    private lng: number | null = null;

    private pLat = 1;
    private pLng = 1;

    private vLat = 0;
    private vLng = 0;

    private lastTimestamp: number | null = null;

    update(
        rawLat: number,
        rawLng: number,
        timestamp: number,
        accuracy: number = 10,
    ): { latitude: number; longitude: number } {
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

        // Normalize to seconds
        const dt = Math.max((timestamp - this.lastTimestamp) / 1000, 0.001);
        this.lastTimestamp = timestamp;

        // Predict
        const predictedLat = this.lat + this.vLat * dt;
        const predictedLng = this.lng + this.vLng * dt;

        this.pLat += this.Q;
        this.pLng += this.Q;

        // Scale R by accuracy — worse fix = trust less
        const R = this.R * Math.max(accuracy / 5, 1);

        // Kalman gain
        const kLat = this.pLat / (this.pLat + R);
        const kLng = this.pLng / (this.pLng + R);

        // Blend
        const smoothedLat = predictedLat + kLat * (rawLat - predictedLat);
        const smoothedLng = predictedLng + kLng * (rawLng - predictedLng);

        // Velocity — slower adaptation, more stable
        const alpha = 0.1;
        this.vLat =
            alpha * ((smoothedLat - this.lat) / dt) + (1 - alpha) * this.vLat;
        this.vLng =
            alpha * ((smoothedLng - this.lng) / dt) + (1 - alpha) * this.vLng;

        // Reduce uncertainty
        this.pLat = (1 - kLat) * this.pLat;
        this.pLng = (1 - kLng) * this.pLng;

        this.lat = smoothedLat;
        this.lng = smoothedLng;

        return { latitude: smoothedLat, longitude: smoothedLng };
    }

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
