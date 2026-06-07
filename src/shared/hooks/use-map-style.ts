import { MAP_STYLES } from "../constant/map";
import { useTheme } from "./use-theme";

export const useMapStyle = (mapStyle: string) => {
    const theme = useTheme();

    return MAP_STYLES.filter((s) => s.name === mapStyle)[0].style;
};
