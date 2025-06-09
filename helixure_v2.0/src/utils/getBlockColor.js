// utils/getTailwindBlockColor.js
import getColorOfDay from "./getColorOfDay";
import getHueByTime from "./getHueByTime";

const getTailwindBlockColor = () => {
  const baseColor = getColorOfDay(); // e.g., "blue"
  const hue = getHueByTime(); // "light", "medium", "dark"

  // Map hue to Tailwind intensity levels
  const hueMap = {
    vvlight: "100",
    vlight: "200",
    mlight: "300",
    light: "400",
    medium: "500",
    mdark: "600",
    dark: "700",
    vdark: "800",
    vvdark: "900",
  };

  const intensity = hueMap[hue];
  return `bg-${baseColor}-${intensity}`; // e.g., "bg-blue-100"
};

export default getTailwindBlockColor;
