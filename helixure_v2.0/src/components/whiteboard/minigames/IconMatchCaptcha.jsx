import React, { useEffect, useState } from "react";
import {
  FaLock,
  FaBolt,
  FaBullseye,
  FaBan,
  FaBomb,
  FaCloud,
  FaAnchor,
  FaLeaf,
  FaSmile,
  FaStar,
  FaHeart,
  FaFire,
  FaMoon,
  FaSun,
  FaThumbsUp,
  FaThumbsDown,
  FaShieldAlt,
  FaBug,
  FaCamera,
  FaCompass,
} from "react-icons/fa";

const icons = [
  { id: "lock", icon: <FaLock /> },
  { id: "bolt", icon: <FaBolt /> },
  { id: "bullseye", icon: <FaBullseye /> },
  { id: "ban", icon: <FaBan /> },
  { id: "bomb", icon: <FaBomb /> },
  { id: "cloud", icon: <FaCloud /> },
  { id: "anchor", icon: <FaAnchor /> },
  { id: "leaf", icon: <FaLeaf /> },
  { id: "smile", icon: <FaSmile /> },
  { id: "star", icon: <FaStar /> },
  { id: "heart", icon: <FaHeart /> },
  { id: "fire", icon: <FaFire /> },
  { id: "moon", icon: <FaMoon /> },
  { id: "sun", icon: <FaSun /> },
  { id: "thumbsup", icon: <FaThumbsUp /> },
  { id: "thumbsdown", icon: <FaThumbsDown /> },
  { id: "shield", icon: <FaShieldAlt /> },
  { id: "bug", icon: <FaBug /> },
  { id: "camera", icon: <FaCamera /> },
  { id: "compass", icon: <FaCompass /> },
];

const IconMatchCaptcha = ({ onSuccess = () => {}, onClose = () => {} }) => {
  const [options, setOptions] = useState([]);
  const [target, setTarget] = useState(null);
  const [gas, setGas] = useState(0.0);
  const [locked, setLocked] = useState(false);

  useEffect(() => {
    const shuffled = [...icons].sort(() => Math.random() - 0.5).slice(0, 4);
    const chosen = shuffled[Math.floor(Math.random() * shuffled.length)];
    setOptions(shuffled);
    setTarget(chosen);
  }, []);

  const handleClick = (clickedId) => {
    if (locked) return;
    setGas((prev) => +(prev + 0.000005).toFixed(6));

    if (clickedId === target.id) {
      setLocked(true);
      setTimeout(() => onSuccess(gas), 200);
    } else {
      alert("❌ Incorrect icon! Try again.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl text-center space-y-4 w-80 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-3 text-gray-400 hover:text-red-500 text-xl"
        >
          &times;
        </button>

        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
          Icon Match CAPTCHA
        </h2>

        {target && (
          <p className="text-sm text-gray-700 dark:text-gray-300 flex items-center justify-center gap-2">
            Find this icon: <span className="text-2xl">{target.icon}</span>
          </p>
        )}

        <div className="flex justify-center gap-4 text-2xl">
          {options.map((item, index) => (
            <button
              key={index}
              onClick={() => handleClick(item.id)}
              className="p-2 hover:scale-110 transition-transform"
            >
              {item.icon}
            </button>
          ))}
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-300">
          Gas used: <span className="font-mono">{gas}</span>
        </p>
      </div>
    </div>
  );
};

export default IconMatchCaptcha;
