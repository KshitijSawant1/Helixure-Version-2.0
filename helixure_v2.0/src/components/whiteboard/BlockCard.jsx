// src/components/whiteboard/BlockCard.jsx
import React, { useRef, useEffect, useState } from "react";

const BlockCard = ({
  id,
  x,
  y,
  updatePosition,
  blocks,
  selectedhuecolor = "blue-400",
}) => {
  const cardRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const offset = useRef({ x: 0, y: 0 });
  const colorClassMap = {
    "blue-400": {
      border: "border-blue-400",
      bg: "bg-blue-400",
      badge: "bg-blue-100 text-blue-500",
    },
  };
  // Safely extract tailwind classes
  const { border, bg, badge } = colorClassMap[selectedhuecolor] || {
    border: "border-gray-300",
    bg: "bg-gray-300",
    badge: "bg-gray-200 text-gray-600",
  };
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
      onMouseDown={startDrag}
      onTouchStart={startDrag}
      className={`absolute w-72 max-w-full bg-white ${border} border-2 rounded-lg shadow-md cursor-move select-none transition-all`}
      style={{ left: `${x}px`, top: `${y}px` }}
    >
      <div className={`w-full h-2 rounded-t-md ${bg}`}></div>

      <div className="p-4 pt-3">
        <h2 className="text-lg font-bold mb-1">Block {id}</h2>
        <div className="mb-2">
          <h2 className="text-base font-semibold text-gray-900">Block Title</h2>
          <p className="text-xs text-gray-600 mt-0.5">
            This is a description of the block, summarizing its purpose or
            contents.
          </p>
        </div>

        <div className="text-xs mb-2">
          <div>
            <strong>Hash:</strong> 0x hash1234567890
          </div>
          <div>
            <strong>Prev:</strong> 0x hash1234567890
          </div>
        </div>

        <div className="flex items-center justify-between text-xs">
          <strong>
            Gas: <span className="text-green-500 font-mono">0.000032 </span>
          </strong>
        </div>

        <div className="text-xs mb-2 text-gray-700">
          <span className="font-semibold">Timestamp:</span>{" "}
          <span className="text-gray-500 ml-1">
            {new Date().toLocaleTimeString()}
          </span>
        </div>

        <div className="flex items-center justify-between text-xs mb-2">
          <span className={`px-2 py-0.5 rounded-full text-[10px] ${badge}`}>
            {selectedhuecolor}
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
