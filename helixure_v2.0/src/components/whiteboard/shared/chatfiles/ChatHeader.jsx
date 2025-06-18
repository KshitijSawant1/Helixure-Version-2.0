import React from "react";

const ChatHeader = ({ onClose }) => {
  return (
    <div className="bg-gradient-to-r from-blue-100 via-violet-100 to-green-100 border-2 border-dashed border-blue-300 text-black p-4 rounded-t relative">
      <button
        onClick={onClose}
        className="absolute top-2 right-2 text-2xl text-red-500 hover:text-red-600"
      >
        &times;
      </button>
      <h2 className="font-bold text-lg">Helixure</h2>
      <p className="text-sm opacity-80">
        In Space Chat & Log — Keep Conversations and Records in Sync
      </p>
    </div>
  );
};

export default ChatHeader;
