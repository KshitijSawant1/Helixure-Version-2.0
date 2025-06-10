import React from "react";

const BlockCardPreview = ({
  id,
  title,
  description,
  selectedhuecolor = "green-500",
}) => {
  const colorClassMap = {
    "green-500": {
      border: "border-green-500",
      bg: "bg-green-500",
      badge: "bg-green-100 text-green-600",
    }
  };

  const { border, bg, badge } = colorClassMap[selectedhuecolor] || {
    border: "border-gray-300",
    bg: "bg-gray-300",
    badge: "bg-gray-200 text-gray-600",
  };

  return (
    <div
      className={`w-full max-w-md mx-auto bg-white ${border} border-2 rounded-lg shadow-md transition-all`}
    >
      <div className={`w-full h-2 rounded-t-md ${bg}`} />
      <div className="p-4 pt-3">
        <h2 className="text-lg font-bold mb-1">Block {id}</h2>
        <div className="mb-2">
          <h3 className="text-base font-semibold text-gray-900">{title}</h3>
          <p className="text-xs text-gray-600 mt-0.5">{description}</p>
        </div>
        <div className="text-xs mb-2">
          <div>
            <strong>Hash:</strong> 0x hash1234567890
          </div>
          <div>
            <strong>Prev:</strong> 0x hash1234567890
          </div>
        </div>
        <div className="text-xs text-gray-700 mb-2">
          <strong>Gas:</strong>{" "}
          <span className="text-green-500 font-mono">0.000032</span>
        </div>
        <div className="text-xs text-gray-700 mb-2">
          <strong>Timestamp:</strong>{" "}
          <span className="text-gray-500 ml-1">
            {new Date().toLocaleTimeString()}
          </span>
        </div>
        <div className="text-xs mb-2">
          <span className={`px-2 py-0.5 rounded-full text-[10px] ${badge}`}>
            {selectedhuecolor}
          </span>
        </div>
        <div className="text-xs bg-gray-50 text-gray-800 p-2 rounded border border-gray-200">
          <strong>Data:</strong> Example text-only block data.
        </div>
      </div>
    </div>
  );
};

export default BlockCardPreview;
