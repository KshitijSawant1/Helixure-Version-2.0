import React, { useState } from "react";
import BlockCardPreview from "./BlockCardPreview";
import { supabase } from "../../supabaseClient";

const SearchBlockModal = ({ isOpen, onClose }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [blocks, setBlocks] = useState([]);

  const handleSearch = async (e) => {
    e.preventDefault();

    if (!searchQuery.trim()) {
      alert("Please enter a valid search query.");
      return;
    }

    const { data, error } = await supabase
      .from("space_block_table")
      .select("*")
      .ilike("block_title", `%${searchQuery}%`);

    if (error || !data || data.length === 0) {
      setBlocks([]);
      setShowPreview(false);
      alert("No matching blocks found!");
      return;
    }

    setBlocks(data);
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

        {showPreview && blocks.length > 0 && (
          <div className="mt-6">
            <h3 className="text-md font-semibold mb-4 text-gray-800 dark:text-white">
              Matching Blocks
            </h3>

            <div className="flex flex-wrap gap-4 justify-center max-h-[70vh] overflow-y-auto pr-2">
              {blocks.map((block, index) => (
                <BlockCardPreview
                  key={block.id}
                  sr={block.block_sr || index + 1}
                  title={block.block_title}
                  description={block.block_description}
                  hash={block.hash}
                  previousHash={block.previous_hash}
                  gas={block.gas}
                  timestamp={block.timestamp}
                  hue_color={block.hue_color}
                  data={block.block_files?.[0]?.name}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchBlockModal;
