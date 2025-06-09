import React, { useState, useEffect } from "react";

const PinUnlockGame = ({ onComplete, onClose }) => {
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
          onComplete();
        } else {
          alert("❌ Incorrect Pin. Try again!");
          setUserPin([]);
        }
      }, 200);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg text-center shadow-xl space-y-4 w-80">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
          Unlock the Pin
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-300">
          Tap the dots in the correct sequence
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 italic">
          Pin: <span className="font-mono">{correctPin.join(" → ")}</span>
        </p>

        <div className="grid grid-cols-3 gap-4 mx-auto w-fit">
          {[...Array(gridSize)].map((_, i) => (
            <button
              key={i}
              onClick={() => handleClick(i + 1)}
              className={`w-12 h-12 rounded-full border-2 transition ${
                userPin.includes(i + 1)
                  ? "bg-blue-500 border-blue-700"
                  : "bg-gray-300 border-gray-500"
              }`}
            />
          ))}
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-300">
          Gas used: <span className="font-mono">{gas}</span>
        </p>
      </div>
    </div>
  );
};

export default PinUnlockGame;
