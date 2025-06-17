import React, { useState } from "react";
import InstructionModal from "../components/whiteboard/InstructionModal";
import SharedInstructionDrawer from "../components/whiteboard/shared/SharedIntructionModal";
import SlideBlockGame from "./whiteboard/minigames/SlideBlockGame";
import DragDropSortGame from "./whiteboard/minigames/DragSortGame";
import PinUnlockGame from "./whiteboard/minigames/PinUnlockGame";
import IconMatchCaptcha from "./whiteboard/minigames/IconMatchCaptcha";
import PageNotFound from "./PageNotFound";


const ResultPage = () => {
  const [showPrivateModal, setShowPrivateModal] = useState(false);
  const [showSharedModal, setShowSharedModal] = useState(false);
  const [showGame, setShowGame] = useState(false);
  const [showSortGame, setShowSortGame] = useState(false);
  const [showPatternGame, setShowPatternGame] = useState(false);
  const [showEmojiGame, setShowEmojiGame] = useState(false);

  const isAnyGameActive =
    showGame || showSortGame || showPatternGame || showEmojiGame;

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-2xl font-semibold text-gray-800">
        You're in the result zone!
      </h2>

      <div className="flex gap-4 flex-wrap">
        <button
          onClick={() => setShowPrivateModal(true)}
          className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition"
        >
          Show Instructions
        </button>
        <button
          onClick={() => setShowSharedModal(true)}
          className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition"
        >
          Show Shared Instructions
        </button>
      </div>

      {showPrivateModal && (
        <InstructionModal onClose={() => setShowPrivateModal(false)} />
      )}
      {showSharedModal && (
        <SharedInstructionDrawer onClose={() => setShowSharedModal(false)} />
      )}

      <div className="flex gap-4 flex-wrap">
        <button
          onClick={() => {
            setShowGame(true);
            setShowSortGame(false);
          }}
          disabled={isAnyGameActive}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          Start Slide Block Game
        </button>
        <button
          onClick={() => {
            setShowSortGame(true);
            setShowGame(false);
          }}
          disabled={isAnyGameActive}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          Launch Drag-and-Drop Sort Game
        </button>
        <button
          onClick={() => setShowPatternGame(true)}
          disabled={isAnyGameActive}
          className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 disabled:opacity-50"
        >
          Launch Pin Unlock Game
        </button>
        <button
          onClick={() => setShowEmojiGame(true)}
          disabled={isAnyGameActive}
          className="bg-purple-600 text-white px-4 py-2 rounded shadow hover:bg-purple-700 disabled:opacity-50"
        >
          Launch Emoji Match CAPTCHA
        </button>
      </div>

      {showGame && (
        <SlideBlockGame
          onComplete={() => setShowGame(false)}
          onClose={() => setShowGame(false)}
        />
      )}
      {showSortGame && (
        <DragDropSortGame
          onComplete={() => setShowSortGame(false)}
          onClose={() => setShowSortGame(false)}
        />
      )}
      {showPatternGame && (
        <PinUnlockGame
          onComplete={() => {
            console.log("Pattern matched successfully!");
            setShowPatternGame(false);
          }}
          onClose={() => setShowPatternGame(false)}
        />
      )}
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
