// rename file to use-map-style.ts
import { MAP_STYLES } from "../constant/constant";
import { useTheme } from "./use-theme";

export const useMapStyle = () => {
    const theme = useTheme();
    return MAP_STYLES[0].style[theme];
};
