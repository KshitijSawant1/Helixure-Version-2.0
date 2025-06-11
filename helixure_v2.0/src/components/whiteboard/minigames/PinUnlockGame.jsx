import React, { useState } from "react";

const PinUnlockGame = ({ onSuccess = () => {}, onClose = () => {} }) => {
  const gridSize = 9;

  const generateRandomPin = () => {
    const shuffled = [...Array(gridSize)]
      .map((_, i) => i + 1)
      .sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 3);
  };

  const [correctPin, setCorrectPin] = useState(generateRandomPin);
  const [userPin, setUserPin] = useState([]);
  const [gas, setGas] = useState(0.0);

  const handleClick = (value) => {
    if (userPin.includes(value)) return;

    const newPin = [...userPin, value];
    setUserPin(newPin);
    setGas((prev) => +(prev + 0.000005).toFixed(6));

    if (newPin.length === correctPin.length) {
      setTimeout(() => {
        if (JSON.stringify(newPin) === JSON.stringify(correctPin)) {
          onSuccess(gas + 0.000005);
        } else {
          alert("❌ Incorrect Pin. Try again!");
          setUserPin([]);
        }
      }, 200);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg text-center shadow-xl space-y-4 w-80 relative">
        {/* ❌ Close Button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-3 text-gray-400 hover:text-red-500 text-xl"
        >
          &times;
        </button>

        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
          Unlock the Pin
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-300">
          Tap the circles in the correct sequence
        </p>

        {/* Show correctPin for debug – remove before production */}
        <p className="text-xs text-gray-500 dark:text-gray-400 italic">
          Pin: <span className="font-mono">{correctPin.join(" → ")}</span>
        </p>

        <div className="grid grid-cols-3 gap-4 mx-auto w-fit">
          {[...Array(gridSize)].map((_, i) => {
            const value = i + 1;
            const isSelected = userPin.includes(value);
            return (
              <button
                key={value}
                onClick={() => handleClick(value)}
                disabled={isSelected}
                className={`w-12 h-12 rounded-full border-2 transition duration-150 ${
                  isSelected
                    ? "bg-blue-500 border-blue-700 cursor-not-allowed"
                    : "bg-gray-300 border-gray-500 hover:scale-110 hover:border-blue-500"
                }`}
              />
            );
          })}
        </div>

        <p className="text-xs text-gray-500 dark:text-gray-400">
          Your input:{" "}
          <span className="font-mono">{userPin.join(" → ") || "-"}</span>
        </p>

        <p className="text-sm text-gray-600 dark:text-gray-300">
          Gas used: <span className="font-mono">{gas}</span>
        </p>
      </div>
    </div>
  );
};

export default PinUnlockGame;
