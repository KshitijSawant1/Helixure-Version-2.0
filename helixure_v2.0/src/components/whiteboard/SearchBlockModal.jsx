import React, { useState } from "react";
import BlockCardPreview from "./BlockCardPreview";
const SearchBlockModal = ({ isOpen, onClose, onSearch }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showPreview, setShowPreview] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    onSearch(searchQuery);
    setShowPreview(true);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-center items-center backdrop-blur-sm bg-black/30">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md shadow-lg p-6 relative">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Search Block
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-900 dark:hover:text-white text-lg"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSearch} className="space-y-4">
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-white">
              Block Title
            </label>
            <input
              type="text"
              required
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-600 dark:text-white dark:border-gray-500"
              placeholder="Search by title, hash, or block ID"
            />
          </div>

          <div className="pt-4">
            <button
              type="submit"
              className="w-full bg-blue-700 hover:bg-blue-800 text-white py-2 rounded-lg text-sm font-medium"
            >
              Search Block
            </button>
          </div>
        </form>

        {showPreview && (
          <div className="mt-6">
            <h3 className="text-md font-semibold mb-2 text-gray-800 dark:text-white">
              Block Preview
            </h3>
            <BlockCardPreview
              id="abc123"
              title="Block Title"
              description="This is a description of the block, summarizing its purpose or contents."
              selectedhuecolor="green-500"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchBlockModal;
