// utils/getColorOfDay.js
const getColorOfDay = () => {
  const colorPalette = [
    "blue",     // Sunday
    "green",    // Monday
    "red",      // Tuesday
    "purple",   // Wednesday
    "orange",   // Thursday
    "teal",     // Friday
    "pink"      // Saturday
  ];

  const day = new Date().getDay(); // 0 (Sun) - 6 (Sat)
  return colorPalette[day];
};

export default getColorOfDay;
