import React from "react";
import getTextColorFromBg from "../../utils/getTextColorFromBg";

const BlockCardPreview = ({
  sr = "-",
  title,
  description,
  hash,
  previousHash,
  gas,
  timestamp,
  hue_color,
  data,
}) => {
  // Parse hue_color from Supabase (expecting it might be JSON stringified)
  const parsedHue =
    typeof hue_color === "string"
      ? (() => {
          try {
            return JSON.parse(hue_color);
          } catch {
            return { color: hue_color }; // fallback if not JSON
          }
        })()
      : hue_color || {};

  const hueLabel = parsedHue?.label?.replace("bg-", "") || "N/A";
  const backgroundColor = parsedHue?.color || "#D1D5DB"; // fallback to gray-300
  const textColor = getTextColorFromBg(backgroundColor); // Now backgroundColor is ready!

  return (
    <div className="w-full max-w-md mx-auto bg-white border-2 border-gray-300 rounded-lg shadow-md">
      {/* Top hue bar using dynamic hex color */}
      <div
        className="w-full h-5 rounded-t-md transition-all"
        style={{ backgroundColor }}
      />

      <div className="p-4 pt-3">
        <h2 className="text-md font-bold text-gray-800 mb-1">
          Block <span className="text-gray-500">{sr}</span>
        </h2>

        <div className="mb-2">
          <h3 className="text-base font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-600 mt-1">{description}</p>
        </div>

        <div className="text-xs mb-2 break-words">
          <div className="mb-1">
            <strong>Hash:</strong> <span className="text-gray-700">{hash}</span>
          </div>
          <div>
            <strong>Prev:</strong>{" "}
            <span className="text-gray-700">{previousHash}</span>
          </div>
        </div>

        <div className="text-sm text-gray-700 mb-2">
          <strong>Gas:</strong>{" "}
          <span className="text-green-500 font-mono">
            {gas !== undefined && gas !== null && !isNaN(gas)
              ? Number(gas).toFixed(6)
              : "N/A"}
          </span>
        </div>

        <div className="text-sm text-gray-700 mb-2">
          <strong>Timestamp:</strong>{" "}
          <span className="text-gray-600 ml-1">
            {new Date(timestamp).toLocaleString()}
          </span>
        </div>

        <span
          className="px-2 py-0.5 rounded text-xs font-mono"
          style={{
            backgroundColor: parsedHue.color || "#E5E7EB",
            color: textColor,
          }}
        >
          {hueLabel}
        </span>

        <div className="text-sm bg-gray-50 text-gray-800 p-2 rounded border border-gray-200 mt-2">
          <strong>Data:</strong>{" "}
          {data ? <code>{data}</code> : <em>No file attached</em>}
        </div>
      </div>
    </div>
  );
};

export default BlockCardPreview;
