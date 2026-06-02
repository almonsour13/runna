import { MAP_STYLES } from "../constant/map";
import { useTheme } from "./use-theme";

export const useMapStyle = (styleIndex: number) => {
    const theme = useTheme();

    return MAP_STYLES[styleIndex].style;
};
