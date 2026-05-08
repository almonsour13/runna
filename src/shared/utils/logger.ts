const isDev = __DEV__; // Expo global

type LogArgs = unknown[];

export const logger = {
    log: (...args: LogArgs) => {
        if (!isDev) return;
        console.log(...args);
    },

    warn: (...args: LogArgs) => {
        if (!isDev) return;
        console.warn(...args);
    },

    error: (...args: LogArgs) => {
        if (!isDev) return;
        console.error(...args);
    },

    info: (...args: LogArgs) => {
        if (!isDev) return;
        console.info(...args);
    },
};
