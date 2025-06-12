import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import InstructionModal from "../components/whiteboard/InstructionModal";
import SlideBlockGame from "./whiteboard/minigames/SlideBlockGame";
import DragDropSortGame from "./whiteboard/minigames/DragSortGame";
import PinUnlockGame from "./whiteboard/minigames/PinUnlockGame";
import PageNotFound from "./PageNotFound";

import IconMatchCaptcha from "./whiteboard/minigames/IconMatchCaptcha";

const ResultPage = () => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [showGame, setShowGame] = useState(false);
  const [showSortGame, setShowSortGame] = useState(false);
  const [showPatternGame, setShowPatternGame] = useState(false);
  const [showEmojiGame, setShowEmojiGame] = useState(false);

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-2xl font-semibold text-gray-800">
        You're in the result zone!
      </h2>
      <button
        onClick={() => setShowModal(true)}
        className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition"
      >
        Show Instructions
      </button>
      {showModal && <InstructionModal onClose={() => setShowModal(false)} />}

      <div className="flex gap-4">
        <button
          onClick={() => {
            setShowGame(true);
            setShowSortGame(false);
          }}
          disabled={showGame || showSortGame}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          Start Slide Block Game
        </button>

        <button
          onClick={() => {
            setShowSortGame(true);
            setShowGame(false);
          }}
          disabled={showGame || showSortGame}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          Launch Drag-and-Drop Sort Game
        </button>
      </div>
      {showGame && (
        <SlideBlockGame
          onComplete={() => {
            setShowGame(false);
          }}
          onClose={() => setShowGame(false)}
        />
      )}
      {showSortGame && (
        <DragDropSortGame
          onComplete={() => {
            setShowSortGame(false);
          }}
          onClose={() => setShowSortGame(false)}
        />
      )}
      <button
        onClick={() => setShowPatternGame(true)}
        className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700"
      >
        Launch Pin Unlock Game
      </button>
      {showPatternGame && (
        <PinUnlockGame
          onComplete={() => {
            console.log("Pattern matched successfully!");
            setShowPatternGame(false);
          }}
          onClose={() => setShowPatternGame(false)}
        />
      )}
      <button
        onClick={() => setShowEmojiGame(true)}
        className="bg-purple-600 text-white px-4 py-2 rounded shadow hover:bg-purple-700"
      >
        Launch Emoji Match CAPTCHA
      </button>
      {showEmojiGame && (
        <IconMatchCaptcha
          onComplete={() => {
            console.log("🎯 Correct emoji selected!");
            setShowEmojiGame(false);
          }}
          onClose={() => setShowEmojiGame(false)}
        />
      )}

      <PageNotFound />
    </div>
  );
};

export default ResultPage;
