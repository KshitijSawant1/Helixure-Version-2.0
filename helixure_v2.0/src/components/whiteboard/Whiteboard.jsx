import React, { useRef, useState, useEffect } from "react";
import { toast } from "react-toastify";
import BlockCard from "./BlockCard";

const Whiteboard = () => {
  const containerRef = useRef(null);
  const [showGas, setShowGas] = useState(false);
  const handleToggleGas = () => {
    setShowGas((prev) => {
      const newState = !prev;
      toast(newState ? "Gas Meter Enabled" : "Gas Meter Disabled");
      return newState;
    });
  };

  const [showGames, setShowGames] = useState(false);
  const handleToggleGames = () => {
    setShowGames((prev) => {
      const newState = !prev;
      toast(newState ? "PoW Games Mode Enabled" : "PoW Games Mode Disabled");
      return newState;
    });
  };

  const [containerSize, setContainerSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  const [blocks, setBlocks] = useState([
    { id: 1, title: "Block 1", x: 50, y: 100 },
    { id: 2, title: "Block 2", x: 300, y: 300 },
  ]);

  const updatePosition = (id, x, y) => {
    const cardWidth = 288; // Tailwind w-72
    const cardHeight = 160; // Approx height of card

    const clampedX = Math.max(0, Math.min(containerSize.width - cardWidth, x));
    const clampedY = Math.max(
      0,
      Math.min(containerSize.height - cardHeight, y)
    );

    setBlocks((prev) =>
      prev.map((block) =>
        block.id === id ? { ...block, x: clampedX, y: clampedY } : block
      )
    );
  };

  const getLinePath = () => {
    const blockA = document.getElementById("block-1");
    const blockB = document.getElementById("block-2");
    const container = containerRef.current;

    if (!blockA || !blockB || !container) return "";

    const aRect = blockA.getBoundingClientRect();
    const bRect = blockB.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();

    // Start: exact center of sender block (Block A)
    const aX = aRect.left - containerRect.left + aRect.width / 2;
    const aY = aRect.top - containerRect.top + aRect.height / 2;

    // Predefined anchor points on Block B
    const bAnchors = {
      "top-left": [bRect.left, bRect.top],
      "top-center": [bRect.left + bRect.width / 2, bRect.top],
      "top-right": [bRect.right, bRect.top],
      "middle-left": [bRect.left, bRect.top + bRect.height / 2],
      "middle-right": [bRect.right, bRect.top + bRect.height / 2],
      "bottom-left": [bRect.left, bRect.bottom],
      "bottom-center": [bRect.left + bRect.width / 2, bRect.bottom],
      "bottom-right": [bRect.right, bRect.bottom],
    };

    // Find closest anchor point
    let minDistance = Infinity;
    let closestPoint = [0, 0];

    for (const [_, [x, y]] of Object.entries(bAnchors)) {
      const localX = x - containerRect.left;
      const localY = y - containerRect.top;
      const dist = Math.hypot(localX - aX, localY - aY);
      if (dist < minDistance) {
        minDistance = dist;
        closestPoint = [localX, localY];
      }
    }

    const [bX, bY] = closestPoint;

    return `M${aX},${aY} L${bX},${bY}`;
  };

  useEffect(() => {
    const handleResize = () => {
      setContainerSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-screen h-screen overflow-auto bg-gray-100"
    >
      {/* SVG Path Between Blocks */}
      <svg
        className="absolute top-0 left-0 w-full h-full z-0"
        style={{ pointerEvents: "none" }}
      >
        <defs>
          <marker
            id="arrow"
            viewBox="0 0 10 10"
            refX="10"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#3b82f6" />
          </marker>
        </defs>
        <path
          d={getLinePath()}
          stroke="#3b82f6"
          strokeWidth="3"
          fill="none"
          markerEnd="url(#arrow)"
        />
      </svg>

      {/* Render Block Cards */}
      {blocks.map((block) => (
        <BlockCard
          key={block.id}
          id={block.id}
          x={block.x}
          y={block.y}
          updatePosition={updatePosition}
          blocks={blocks}
        />
      ))}
      <div className="relative w-full max-w-lg mx-auto">
        {showGas && (
          <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-50">
            <div
              className="bg-white text-gray-800 font-mono px-6 py-2 text-sm shadow-md "
              style={{
                clipPath: "polygon(10% 0%, 90% 0%, 100% 100%, 0% 100%)",
                WebkitClipPath: "polygon(10% 0%, 90% 0%, 100% 100%, 0% 100%)",
              }}
            >
              Gas Used:{" "}
              <span className="font-bold text-blue-600">0.000028</span>
            </div>
          </div>
        )}
        <div className="fixed z-50 w-full h-16 max-w-lg -translate-x-1/2 bg-white border border-gray-200 rounded-full bottom-4 left-1/2 dark:bg-gray-700 dark:border-gray-600">
          <div className="grid h-full max-w-lg grid-cols-5 mx-auto">
            <button
              data-tooltip-target="tooltip-info"
              type="button"
              className="inline-flex flex-col items-center justify-center px-5 rounded-s-full hover:bg-gray-50 dark:hover:bg-gray-800 group"
            >
              <svg
                className="w-6 h-6 text-gray-800 dark:text-white"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  fillRule="evenodd"
                  d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12Zm9.408-5.5a1 1 0 1 0 0 2h.01a1 1 0 1 0 0-2h-.01ZM10 10a1 1 0 1 0 0 2h1v3h-1a1 1 0 1 0 0 2h4a1 1 0 1 0 0-2h-1v-4a1 1 0 0 0-1-1h-2Z"
                  clipRule="evenodd"
                />
              </svg>

              <span className="sr-only">info</span>
            </button>
            <div
              id="tooltip-info"
              role="tooltip"
              className="absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-white transition-opacity duration-300 bg-gray-900 rounded-lg shadow-xs opacity-0 tooltip dark:bg-gray-700"
            >
              info
              <div className="tooltip-arrow" data-popper-arrow></div>
            </div>
            <button
              data-tooltip-target="tooltip-search"
              type="button"
              className="inline-flex flex-col items-center justify-center px-5 hover:bg-gray-50 dark:hover:bg-gray-800 group"
            >
              <svg
                className="w-6 h-6 text-gray-800 dark:text-white"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M10 2a8 8 0 1 0 0 16 8 8 0 0 0 0-16Z" />
                <path
                  fillRule="evenodd"
                  d="M21.707 21.707a1 1 0 0 1-1.414 0l-3.5-3.5a1 1 0 0 1 1.414-1.414l3.5 3.5a1 1 0 0 1 0 1.414Z"
                  clipRule="evenodd"
                />
              </svg>

              <span className="sr-only">Search</span>
            </button>
            <div
              id="tooltip-search"
              role="tooltip"
              className="absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-white transition-opacity duration-300 bg-gray-900 rounded-lg shadow-xs opacity-0 tooltip dark:bg-gray-700"
            >
              Search
              <div className="tooltip-arrow" data-popper-arrow></div>
            </div>
            <div className="flex items-center justify-center">
              <button
                data-tooltip-target="tooltip-new"
                type="button"
                className="inline-flex items-center justify-center w-10 h-10 font-medium bg-blue-600 rounded-full hover:bg-blue-700 group focus:ring-4 focus:ring-blue-300 focus:outline-none dark:focus:ring-blue-800"
              >
                <svg
                  className="w-4 h-4 text-white"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 18 18"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 1v16M1 9h16"
                  />
                </svg>
                <span className="sr-only">New item</span>
              </button>
            </div>
            <div
              id="tooltip-new"
              role="tooltip"
              className="absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-white transition-opacity duration-300 bg-gray-900 rounded-lg shadow-xs opacity-0 tooltip dark:bg-gray-700"
            >
              Create new item
              <div className="tooltip-arrow" data-popper-arrow></div>
            </div>
            <button
              onClick={handleToggleGas}
              data-tooltip-target="tooltip-gas"
              type="button"
              className="inline-flex flex-col items-center justify-center px-5 hover:bg-gray-50 dark:hover:bg-gray-800 group"
            >
              <svg
                className={`w-6 h-6 ${
                  showGas ? "text-green-600" : "text-red-600"
                } dark:text-white`}
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M18.045 3.007 12.31 3a1.965 1.965 0 0 0-1.4.585l-7.33 7.394a2 2 0 0 0 0 2.805l6.573 6.631a1.957 1.957 0 0 0 1.4.585 1.965 1.965 0 0 0 1.4-.585l7.409-7.477A2 2 0 0 0 21 11.479v-5.5a2.972 2.972 0 0 0-2.955-2.972Zm-2.452 6.438a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z" />
              </svg>

              <span className="sr-only">gas</span>
            </button>
            <div
              id="tooltip-gas"
              role="tooltip"
              className="absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-white transition-opacity duration-300 bg-gray-900 rounded-lg shadow-xs opacity-0 tooltip dark:bg-gray-700"
            >
              gas
              <div className="tooltip-arrow" data-popper-arrow></div>
            </div>
            <button
              onClick={handleToggleGames}
              type="button"
              className="inline-flex flex-col items-center justify-center px-5 rounded-e-full hover:bg-gray-50 dark:hover:bg-gray-800 group"
            >
              <svg
                className={`w-6 h-6 ${
                  showGames ? "text-green-600" : "text-red-600"
                } dark:text-white`}
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12.8638 3.49613C12.6846 3.18891 12.3557 3 12 3s-.6846.18891-.8638.49613l-3.49998 6c-.18042.30929-.1817.69147-.00336 1.00197S8.14193 11 8.5 11h7c.3581 0 .6888-.1914.8671-.5019.1784-.3105.1771-.69268-.0033-1.00197l-3.5-6ZM4 13c-.55228 0-1 .4477-1 1v6c0 .5523.44772 1 1 1h6c.5523 0 1-.4477 1-1v-6c0-.5523-.4477-1-1-1H4Zm12.5-1c-2.4853 0-4.5 2.0147-4.5 4.5s2.0147 4.5 4.5 4.5 4.5-2.0147 4.5-4.5-2.0147-4.5-4.5-4.5Z" />
              </svg>

              <span className="sr-only">Games</span>
            </button>
            <div
              id="tooltip-profile"
              role="tooltip"
              className="absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-white transition-opacity duration-300 bg-gray-900 rounded-lg shadow-xs opacity-0 tooltip dark:bg-gray-700"
            >
              Games
              <div className="tooltip-arrow" data-popper-arrow></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Whiteboard;
