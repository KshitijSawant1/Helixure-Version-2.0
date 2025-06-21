import React from "react";
import getTextColorFromBg from "../../../utils/getTextColorFromBg";

const SharedBlockCardPreview = ({
  sr = "-",
  title = "Untitled Block",
  description = "No description provided.",
  hash = "0x-hash-placeholder",
  previousHash = "0x-prevhash-placeholder",
  gas = "0.000000",
  timestamp = new Date().toISOString(),
  hue_color = "bg-gray-400",
  data = "Empty",
  userName = "Anonymous",
  userAvatar = null,
  userRole = "Viewer",
  userDesignation = "Member",
}) => {
  const avatarSrc =
    userAvatar ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}`;

  let hueColorParsed = {
    label: "Default",
    color: "#9CA3AF", // gray-400
  };

  try {
    hueColorParsed =
      typeof hue_color === "string" && hue_color.includes("{")
        ? JSON.parse(hue_color)
        : typeof hue_color === "object"
        ? hue_color
        : {
            label: hue_color,
            color: "#9CA3AF",
          };
  } catch {
    console.warn("Failed to parse hue_color:", hue_color);
  }

  const { label: hue_color_label, color: fallbackColor } = hueColorParsed;
  const textColor = getTextColorFromBg(fallbackColor);

  return (
    <div className="w-full max-w-md mx-auto bg-white border-2 rounded-lg shadow-md">
      <div
        className="w-full h-5 rounded-t-md"
        style={{ backgroundColor: fallbackColor }}
      ></div>

      <div className="p-4 pt-3">
        <h2 className="text-lg font-bold mb-1">Block {sr}</h2>
        <div className="mb-2">
          <h3 className="text-base font-semibold text-gray-900">{title}</h3>
          <p className="text-xs text-gray-600 mt-0.5 break-words line-clamp-3">
            {description}
          </p>
        </div>

        <div className="text-xs mb-2">
          <div className="overflow-hidden text-ellipsis whitespace-nowrap max-w-full text-xs">
            <strong className="mr-1">Hash:</strong>
            <span
              title={hash}
              className="inline-block max-w-[210px] truncate align-middle text-gray-900 font-mono"
            >
              {hash.slice(0, 20)}...{hash.slice(-5)}
            </span>
          </div>

          <div className="overflow-hidden text-ellipsis whitespace-nowrap max-w-full text-xs">
            <strong className="mr-1">Prev:</strong>
            <span
              title={previousHash}
              className="inline-block max-w-[210px] truncate align-middle text-gray-900 font-mono"
            >
              {previousHash.slice(0, 20)}...{previousHash.slice(-5)}
            </span>
          </div>
        </div>

        <div className="text-xs mb-2 text-gray-700">
          <strong>Gas:</strong>{" "}
          <span className="text-green-500 font-mono">
            {Number(gas).toFixed(6)}
          </span>
        </div>

        <div className="text-xs mb-2 text-gray-700">
          <strong>Timestamp:</strong>{" "}
          <span className="text-gray-500 ml-1">
            {timestamp ? new Date(timestamp).toLocaleString() : "N/A"}
          </span>
        </div>

        <div className="flex items-center space-x-3 mb-2">
          <img
            src={avatarSrc}
            alt={userName}
            className="w-10 h-10 rounded-lg border border-gray-300 shadow-sm object-cover"
          />
          <div className="flex flex-col">
            <span className="font-semibold text-gray-800 text-sm">
              {userName}
            </span>
            <span className="text-xs text-gray-800">{userDesignation}</span>
          </div>
        </div>

        <div className="flex items-center justify-between mb-2">
          <span
            className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px]"
            style={{
              backgroundColor: fallbackColor,
              color: textColor,
            }}
          >
            {hue_color_label}
          </span>

          {(userRole === "Owner" || userRole === "Editor") && (
            <span
              className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded ${
                userRole === "Owner"
                  ? "bg-blue-100 text-blue-700"
                  : "bg-green-100 text-green-700"
              }`}
            >
              {userRole}
            </span>
          )}
        </div>

        <div className="text-xs bg-gray-50 text-gray-800 p-2 rounded border border-gray-200">
          <strong>Data:</strong>{" "}
          {data ? <code>{data}</code> : <em>No file attached</em>}
        </div>
      </div>
    </div>
  );
};

export default SharedBlockCardPreview;
