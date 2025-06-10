import React, { useState } from "react";
import "./InstructionModal.css";
import PoWShowcase from "./PoWShowcase";

const CreateBlockDrawer = ({ isOpen, onClose }) => {
  const [isDropdownOpen, setDropdownOpen] = useState(false);

  return (
    isOpen && (
      <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm flex justify-end">
        <div className="w-[24rem] h-screen bg-white/90 dark:bg-gray-900/90 shadow-lg overflow-y-auto transition-transform p-6 space-y-6">
          <h1>hello</h1>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                Block Title
              </label>
              <input
                type="text"
                className="mt-1 block w-full px-4 py-2 border rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                Block Description
              </label>
              <textarea
                className="mt-1 block w-full px-4 py-2 border rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="4"
                placeholder="Enter description..."
              ></textarea>
            </div>

            {/* Add dropdowns, tags, color pickers, etc. if needed */}

            <div className="flex justify-end mt-6">
              <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                Create Block
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  );
};

export default CreateBlockDrawer;
