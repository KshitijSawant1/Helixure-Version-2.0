import React, { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

const DragSortGame = ({ onSuccess = () => {}, onClose = () => {} }) => {
  const shuffleArray = (arr) => {
    let shuffled = [...arr];
    do {
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
    } while (shuffled.join() === arr.join()); // Retry if not shuffled
    return shuffled;
  };

  const [blocks, setBlocks] = useState(shuffleArray([1, 2, 3, 4]));
  const [gas, setGas] = useState(0.0);

  const handleOnDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(blocks);
    const [moved] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, moved);

    setBlocks(items);
    setGas((prev) => +(prev + 0.000005).toFixed(6));

    if (JSON.stringify(items) === JSON.stringify([1, 2, 3, 4])) {
      setTimeout(() => onSuccess(gas), 300);
    }
  };

  useEffect(() => {
    setBlocks(shuffleArray([1, 2, 3, 4]));
  }, []);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-[340px] shadow-xl text-center space-y-4 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-3 text-gray-400 hover:text-red-500 text-xl"
        >
          &times;
        </button>

        <h2 className="font-semibold text-lg text-gray-800 dark:text-white">
          Drag Blocks to Sort
        </h2>

        <DragDropContext onDragEnd={handleOnDragEnd}>
          <Droppable droppableId="blocks" direction="horizontal">
            {(provided) => (
              <div
                className="flex gap-2 justify-center"
                {...provided.droppableProps}
                ref={provided.innerRef}
              >
                {blocks.map((num, index) => (
                  <Draggable
                    key={num}
                    draggableId={num.toString()}
                    index={index}
                  >
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className="w-12 h-12 bg-blue-500 text-white rounded flex items-center justify-center font-bold text-xl cursor-grab"
                      >
                        {num}
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>

        <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
          Gas used: <span className="font-mono">{gas}</span>
        </p>
      </div>
    </div>
  );
};

export default DragSortGame;
