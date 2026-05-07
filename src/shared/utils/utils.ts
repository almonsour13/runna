export const generateId = () => {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
};

export const timeSession = (date: string) => {
    const dateObj = new Date(date);
    const hour = dateObj.getHours();
    return hour < 12 ? "morning" : hour < 17 ? "noon" : "evening";
};

export function capitalize(str: string) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}
