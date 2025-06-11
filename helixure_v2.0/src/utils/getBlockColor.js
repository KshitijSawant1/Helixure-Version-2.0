// utils/getBlockColor.js

// STEP 1: Define full color map (fill HEX values as needed)
const colorMap = {
  blue: {
    vvlight: "#E1EFFE",
    vlight: "#C3DDFD",
    mlight: "#A4CAFE",
    light: "#76A9FA",
    medium: "#3F83F8",
    mdark: "#1C64F2",
    dark: "#1A56DB",
    vdark: "#1E429F",
    vvdark: "#233876",
  },
  green: {
    vvlight: "#DEF7EC",
    vlight: "#BCF0DA",
    mlight: "#84E1BC",
    light: "#31C48D",
    medium: "#0E9F6E",
    mdark: "#057A55",
    dark: "#046C4E",
    vdark: "#03543F",
    vvdark: "#014737",
  },
  red: {
    vvlight: "#FDE8E8",
    vlight: "#FBD5D5",
    mlight: "#F8B4B4",
    light: "#F98080",
    medium: "#F05252",
    mdark: "#E02424",
    dark: "#C81E1E",
    vdark: "#9B1C1C",
    vvdark: "#771D1D",
  },
  purple: {
    vvlight: "#EDEBFE",
    vlight: "#DCD7FE",
    mlight: "#CABFFD",
    light: "#AC94FA",
    medium: "#9061F9",
    mdark: "#7E3AF2",
    dark: "#6C2BD9",
    vdark: "#5521B5",
    vvdark: "#4A1D96",
  },
  orange: {
    vvlight: "#FFF7ED",
    vlight: "#FFEDD5",
    mlight: "#FED7AA",
    light: "#FDBA74",
    medium: "#FB923C",
    mdark: "#F97316",
    dark: "#EA580C",
    vdark: "#C2410C",
    vvdark: "#9A3412",
  },
  indigo: {
    vvlight: "#E5EDFF",
    vlight: "#CDDBFE",
    mlight: "#B4C6FC",
    light: "#8DA2FB",
    medium: "#6875F5",
    mdark: "#5850EC",
    dark: "#5145CD",
    vdark: "#42389D",
    vvdark: "#362F78",
  },
  pink: {
    vvlight: "#FCE8F3",
    vlight: "#FAD1E8",
    mlight: "#F8B4D9",
    light: "#F17EB8",
    medium: "#E74694",
    mdark: "#D61F69",
    dark: "#BF125D",
    vdark: "#99154B",
    vvdark: "#751A3D",
  },
};

// STEP 2: Get color of the day
const getColorOfDay = () => {
  const colorPalette = [
    "blue",
    "green",
    "red",
    "purple",
    "orange",
    "indigo",
    "pink",
  ];
  return colorPalette[new Date().getDay()];
};

// STEP 3: Get hue by hour
const getHueByTime = () => {
  const hour = new Date().getHours();
  if (hour < 6) return "vvlight";
  if (hour < 9) return "vlight";
  if (hour < 12) return "mlight";
  if (hour < 15) return "light";
  if (hour < 17) return "medium";
  if (hour < 19) return "dark";
  if (hour < 21) return "mdark";
  if (hour < 23) return "vdark";
  return "vvdark";
};

// STEP 4: Final Export
const getBlockColor = () => {
  const base = getColorOfDay();
  const shade = getHueByTime();
  const label = `bg-${base}-${shade}`;
  const borderLabel = `border-${base}-${shade}`;
  const color = colorMap?.[base]?.[shade] || "#cccccc";

  return { label, borderLabel, color };
};

export default getBlockColor;
