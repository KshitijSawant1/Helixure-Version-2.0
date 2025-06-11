import React, { useEffect, useState, useCallback } from "react";
import {
  FaArrowUp,
  FaArrowDown,
  FaArrowLeft,
  FaArrowRight,
  FaStopCircle,
  FaBullseye,
} from "react-icons/fa";

const SlideBlockGame = ({ onSuccess = () => {}, onClose = () => {} }) => {
  const gridSize = 3;

  const getRandomCell = () => ({
    row: Math.floor(Math.random() * gridSize),
    col: Math.floor(Math.random() * gridSize),
  });

  const generatePositions = () => {
    let start = getRandomCell();
    let end = getRandomCell();
    while (start.row === end.row && start.col === end.col) {
      end = getRandomCell(); // Prevent same start & end
    }
    return { start, end };
  };

  const [gameState, setGameState] = useState(() => {
    const { start, end } = generatePositions();
    return {
      start,
      end,
      position: start,
      gas: 0.0,
    };
  });

  const { position, end, gas } = gameState;

  const move = useCallback(
    (dr, dc) => {
      const newRow = position.row + dr;
      const newCol = position.col + dc;

      if (
        newRow >= 0 &&
        newRow < gridSize &&
        newCol >= 0 &&
        newCol < gridSize
      ) {
        const newGas = +(gas + 0.000005).toFixed(6);
        const newPosition = { row: newRow, col: newCol };

        setGameState((prev) => ({
          ...prev,
          position: newPosition,
          gas: newGas,
        }));

        if (newRow === end.row && newCol === end.col) {
          setTimeout(() => onSuccess(newGas), 300);
        }
      }
    },
    [position, end, gas, onSuccess]
  );

  // Keyboard movement support
  useEffect(() => {
    const handleKeyDown = (e) => {
      switch (e.key) {
        case "ArrowUp":
          e.preventDefault();
          move(-1, 0);
          break;
        case "ArrowDown":
          e.preventDefault();
          move(1, 0);
          break;
        case "ArrowLeft":
          e.preventDefault();
          move(0, -1);
          break;
        case "ArrowRight":
          e.preventDefault();
          move(0, 1);
          break;
        default:
          break;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [move]);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-[320px] shadow-xl text-center space-y-4 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-3 text-gray-400 hover:text-red-500 text-xl"
        >
          &times;
        </button>

        <h2 className="font-semibold text-lg text-gray-800 dark:text-white">
          Slide the Block to the Goal
        </h2>

        {/* Grid */}
        <div className="grid grid-cols-3 gap-2 w-fit mx-auto">
          {[...Array(gridSize)].map((_, row) =>
            [...Array(gridSize)].map((_, col) => {
              const isCurrent = position.row === row && position.col === col;
              const isTarget = end.row === row && end.col === col;

              return (
                <div
                  key={`${row}-${col}`}
                  className={`w-12 h-12 border rounded flex items-center justify-center text-xl font-bold ${
                    isCurrent
                      ? "bg-blue-500 text-white"
                      : isTarget
                      ? "bg-green-500 text-white"
                      : "bg-gray-100 dark:bg-gray-700"
                  }`}
                >
                  {isCurrent ? (
                    <FaStopCircle />
                  ) : isTarget ? (
                    <FaBullseye />
                  ) : null}
                </div>
              );
            })
          )}
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-2">
          <button
            onClick={() => move(-1, 0)}
            className="bg-gray-200 p-2 rounded hover:bg-gray-300"
          >
            <FaArrowUp />
          </button>
        </div>
        <div className="flex justify-center gap-4">
          <button
            onClick={() => move(0, -1)}
            className="bg-gray-200 p-2 rounded hover:bg-gray-300"
          >
            <FaArrowLeft />
          </button>
          <button
            onClick={() => move(1, 0)}
            className="bg-gray-200 p-2 rounded hover:bg-gray-300"
          >
            <FaArrowDown />
          </button>
          <button
            onClick={() => move(0, 1)}
            className="bg-gray-200 p-2 rounded hover:bg-gray-300"
          >
            <FaArrowRight />
          </button>
        </div>

        {/* Gas Display */}
        <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
          Gas used: <span className="font-mono">{gas}</span>
        </p>
      </div>
    </div>
  );
};

export default SlideBlockGame;
