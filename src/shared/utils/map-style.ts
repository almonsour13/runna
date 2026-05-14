import { MAP_STYLES } from "../constant/constant";
import { useTheme } from "../hooks/use-theme";

export const getMapStyle = () => {
    const theme = useTheme();

    return MAP_STYLES[0].style[theme];
};
