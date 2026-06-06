export const chunkArray = <T>(array: T[], size: number): T[][] => {
    if (size <= 0) return [array];
    return Array.from({ length: Math.ceil(array.length / size) }, (_, i) =>
        array.slice(i * size, i * size + size),
    );
};
