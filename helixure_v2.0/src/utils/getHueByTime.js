// utils/getHueByTime.js
const getHueByTime = () => {
  const hour = new Date().getHours();

  if (hour < 6) return "vvlight"; // Early Morning
  if (hour < 9) return "vlight"; // Morning
  if (hour < 12) return "mlight"; // Late Morning
  if (hour < 15) return "light"; // Early Afternoon
  if (hour < 17) return "medium"; // Afternoon
  if (hour < 19) return "mdark"; // Evening
  if (hour < 21) return "dark"; // Late Evening
  if (hour < 23) return "vdark"; // Night
  return "vvdark"; // Midnight & Late Night
};

export default getHueByTime;
