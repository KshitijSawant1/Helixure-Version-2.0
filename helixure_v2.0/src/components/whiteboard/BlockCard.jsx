// src/components/whiteboard/BlockCard.jsx
import React, { useRef, useEffect, useState } from "react";
import getTextColorFromBg from "../../utils/getTextColorFromBg";

const BlockCard = ({
  id,
  sr,
  x,
  y,
  updatePosition,
  blocks,
  hue_color = "bg-gray-400",
  title = "Untitled Block",
  description = "No description provided.",
  hash = "0x-hash-placeholder",
  previousHash = "0x-prevhash-placeholder",
  gas = "0.000000",
  data = "Empty",
  timestamp = new Date().toISOString(),
  isFlowMode = false,
}) => {
  const cardPositionStyle = isFlowMode
    ? {}
    : {
        position: "absolute",
        left: `${x}px`,
        top: `${y}px`,
      };

  const cardRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const offset = useRef({ x: 0, y: 0 });

  let hueColorParsed = {
    label: "Default",
    borderLabel: "border-gray-400",
    color: "#9CA3AF",
  };

  try {
    hueColorParsed =
      typeof hue_color === "string" && hue_color.includes("{")
        ? JSON.parse(hue_color)
        : typeof hue_color === "object"
        ? hue_color
        : {
            label: hue_color,
            borderLabel: "border-gray-400",
            color: "#9CA3AF", // fallback HEX
          };
  } catch (err) {
    console.warn("Failed to parse hue_color:", hue_color);
  }

  const {
    label: hue_color_label,
    borderLabel: borderColor,
    color: fallbackColor,
  } = hueColorParsed;

  const badge = hue_color.replace("bg-", "bg-") + " text-gray-700";

  // Safely extract tailwind classes

  const isOverlapping = (newX, newY) => {
    const width = 288; // Tailwind w-72 in px
    const height = 160; // Approximate height of card
    const padding = 2;

    return blocks.some((block) => {
      if (block.id === id) return false; // Don’t compare with self
      return (
        newX < block.x + width + padding &&
        newX + width + padding > block.x &&
        newY < block.y + height + padding &&
        newY + height + padding > block.y
      );
    });
  };

  useEffect(() => {
    const card = cardRef.current;

    const onMouseMove = (e) => {
      if (!isDragging) return;
      const newX = e.clientX - offset.current.x;
      const newY = e.clientY - offset.current.y;
      if (!isOverlapping(newX, newY)) {
        updatePosition(id, newX, newY);
      }
    };

    const onMouseUp = () => setIsDragging(false);

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);

    // Optional: Add mobile support
    const onTouchMove = (e) => {
      if (!isDragging) return;
      const touch = e.touches[0];
      const newX = touch.clientX - offset.current.x;
      const newY = touch.clientY - offset.current.y;
      if (!isOverlapping(newX, newY)) {
        updatePosition(id, newX, newY);
      }
    };

    const onTouchEnd = () => setIsDragging(false);

    window.addEventListener("touchmove", onTouchMove);
    window.addEventListener("touchend", onTouchEnd);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [isDragging, id, updatePosition]);

  const startDrag = (e) => {
    setIsDragging(true);
    const rect = cardRef.current.getBoundingClientRect();
    const clientX = e.clientX || e.touches?.[0]?.clientX;
    const clientY = e.clientY || e.touches?.[0]?.clientY;

    offset.current = {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  return (
    <div
      id={`block-${id}`}
      ref={cardRef}
      onMouseDown={!isFlowMode ? startDrag : undefined}
      onTouchStart={!isFlowMode ? startDrag : undefined}
      className={`w-72 max-w-full bg-white border-2 rounded-lg shadow-md hover:shadow-lg transition-all select-none ${
        isFlowMode ? "" : "absolute cursor-move"
      }`}
      style={{
        ...(isFlowMode ? {} : { left: `${x}px`, top: `${y}px` }),
        borderColor: fallbackColor,
        height: "305px",
      }}
    >
      <div
        className="w-full h-5 rounded-t-md"
        style={{ backgroundColor: fallbackColor }}
      ></div>

      <div className="p-4 pt-3">
        <h2 className="text-lg font-bold mb-1">Block {sr}</h2>
        <div className="mb-2">
          <h2 className="text-base font-semibold text-gray-900">{title}</h2>
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

        <div className="flex items-center justify-between text-xs">
          <strong>
            Gas:{" "}
            <span className="text-green-500 font-mono">
              {Number(gas).toFixed(6)}
            </span>
          </strong>
        </div>

        <div className="text-xs mb-2 text-gray-700">
          <span className="font-semibold">Timestamp:</span>{" "}
          <span className="text-gray-500 ml-1">
            {timestamp ? new Date(timestamp).toLocaleString() : "N/A"}
          </span>
        </div>

        <div className="flex items-center justify-between text-xs mb-2">
          <span
            className="px-2 py-0.5 rounded-full text-[10px]"
            style={{
              backgroundColor: fallbackColor,
              color: getTextColorFromBg(fallbackColor),
            }}
          >
            {hue_color_label}
          </span>
        </div>

        <div className="text-xs bg-gray-50 text-gray-800 p-2 rounded border border-gray-200 mb-1">
          <strong>Data:</strong> Example text-only block data.
        </div>
      </div>
    </div>
  );
};

export default BlockCard;
