// src/components/whiteboard/BlockCard.jsx
import React, { useRef, useEffect, useState } from "react";

const BlockCard = ({ id, x, y, updatePosition, blocks }) => {
  const cardRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const offset = useRef({ x: 0, y: 0 });

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
      className="absolute w-72 max-w-full p-4 bg-white border border-gray-300 rounded-lg shadow-md cursor-move select-none transition-all"
      style={{ left: `${x}px`, top: `${y}px` }}
    >
      <h2 className="text-xl font-bold mb-2">Block {id}</h2>
      <p className="text-gray-700 text-sm mb-3">
        This is block #{id}. Drag me around!
      </p>
      <button className="px-3 py-1 text-sm text-white bg-blue-600 rounded hover:bg-blue-700">
        Action
      </button>
    </div>
  );
};

export default BlockCard;
