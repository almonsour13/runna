export function convertMsToS(durationMs: number) {
    return durationMs / 1000;
}
export function convertSToMs(durationS: number) {
    return durationS * 1000;
}
export const convertMtoKm = (m: number) => {
    return m / 1000;
};
export const convertKmToM = (km: number) => {
    return km * 1000;
};

export const convertKmToMiles = (km: number) => {
    return km * 0.621371;
};

export const convertMilesToKm = (miles: number) => {
    return miles / 0.621371;
};
export const convertCmToInch = (cm: number) => {
    return cm / 2.54;
};

export const convertInchToCm = (inch: number) => {
    return inch * 2.54;
};

export const convertFtInToCm = (ft: number, inches: number): number =>
    Math.round((ft * 12 + inches) * 2.54);

export const convertCmToFtIn = (cm: number): { ft: number; inches: number } => {
    const totalInches = cm / 2.54;
    const ft = Math.floor(totalInches / 12);
    const inches = Math.round(totalInches % 12);
    return { ft, inches };
};
