import React, { useState } from "react";
import SharedBlockCardPreview from "./SharedBlockCardPreview";
import { supabase } from "../../../supabaseClient";

const colorMap = {
  blue: { light: "#76A9FA", medium: "#3F83F8", dark: "#1A56DB" },
  green: { light: "#31C48D", medium: "#0E9F6E", dark: "#046C4E" },
  red: { light: "#F98080", medium: "#F05252", dark: "#C81E1E" },
  purple: { light: "#AC94FA", medium: "#9061F9", dark: "#6C2BD9" },
  orange: { light: "#FDBA74", medium: "#FB923C", dark: "#EA580C" },
  indigo: { light: "#8DA2FB", medium: "#6875F5", dark: "#5145CD" },
  pink: { light: "#F17EB8", medium: "#E74694", dark: "#BF125D" },
};

const SearchSharedBlockModal = ({ isOpen, onClose, sharedSpaceId }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showDateRange, setShowDateRange] = useState(false);
  const [searchPeriod, setSearchPeriod] = useState("");
  const [periodAnchor, setPeriodAnchor] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [availableColors, setAvailableColors] = useState([]);
  const [filterColor, setFilterColor] = useState("");

  const hexToLabelMap = Object.entries(colorMap).reduce(
    (acc, [color, shades]) => {
      Object.entries(shades).forEach(([shade, hex]) => {
        acc[hex.toUpperCase()] = `${color}-${shade}`;
      });
      return acc;
    },
    {}
  );

  const handleSearch = async (e) => {
    e.preventDefault();

    if (!searchQuery.trim() && !startDate && !endDate && !searchPeriod) {
      alert("Please enter a search query or select a date period.");
      return;
    }

    if (startDate && endDate && startDate > endDate) {
      alert("Start date cannot be after end date.");
      return;
    }

    if (searchPeriod && !startDate && !endDate) {
      alert("Please select a date to anchor your period search.");
      return;
    }

    setLoading(true);

    let query = supabase
      .from("shared_space_block")
      .select("*")
      .eq("space_id", sharedSpaceId);

    if (searchQuery.trim()) {
      query = query.or(
        `block_title.ilike.%${searchQuery}%,block_desp.ilike.%${searchQuery}%,hash.ilike.%${searchQuery}%`
      );
    }

    if (startDate) query = query.gte("created_at", startDate);
    if (endDate) query = query.lte("created_at", `${endDate}T23:59:59`);

    if (searchPeriod && (startDate || endDate)) {
      const anchorDate = new Date(startDate || endDate);
      let periodStart = new Date(anchorDate);
      let periodEnd = new Date(anchorDate);

      const addDays = (d, n) => new Date(d.setDate(d.getDate() + n));

      switch (searchPeriod) {
        case "weekly":
          if (periodAnchor === "start") addDays(periodEnd, 6);
          if (periodAnchor === "middle") {
            addDays(periodStart, -3);
            addDays(periodEnd, 3);
          }
          if (periodAnchor === "end") addDays(periodStart, -6);
          break;
        case "monthly":
          if (periodAnchor === "start") {
            periodEnd.setMonth(periodEnd.getMonth() + 1);
            periodEnd.setDate(0);
          }
          if (periodAnchor === "middle") {
            periodStart.setDate(1);
            periodEnd = new Date(periodStart);
            periodEnd.setMonth(periodEnd.getMonth() + 1);
            periodEnd.setDate(0);
          }
          if (periodAnchor === "end") {
            periodStart.setMonth(periodStart.getMonth() - 1);
          }
          break;
        case "quarterly":
          if (periodAnchor === "start") {
            periodEnd.setMonth(periodStart.getMonth() + 3);
            periodEnd.setDate(0);
          }
          if (periodAnchor === "middle") {
            periodStart.setMonth(periodStart.getMonth() - 1);
            periodEnd.setMonth(periodEnd.getMonth() + 1);
          }
          if (periodAnchor === "end") {
            periodStart.setMonth(periodStart.getMonth() - 3);
          }
          break;
        case "yearly":
          if (periodAnchor === "start") {
            periodEnd.setFullYear(periodEnd.getFullYear() + 1);
            periodEnd.setDate(0);
          }
          if (periodAnchor === "middle") {
            periodStart.setMonth(0);
            periodEnd = new Date(periodStart);
            periodEnd.setFullYear(periodEnd.getFullYear() + 1);
            periodEnd.setDate(0);
          }
          if (periodAnchor === "end") {
            periodStart.setFullYear(periodStart.getFullYear() - 1);
          }
          break;
        default:
          break;
      }

      const isoStart = periodStart.toISOString().split("T")[0];
      const isoEnd = periodEnd.toISOString().split("T")[0];

      query = query
        .gte("created_at", isoStart)
        .lte("created_at", `${isoEnd}T23:59:59`);
    }

    const { data, error } = await query;
    setLoading(false);

    if (error || !data?.length) {
      setBlocks([]);
      setShowPreview(false);
      alert("No matching blocks found!");
      return;
    }

    setBlocks(data);
    setShowPreview(true);

    const colors = data
      .map((block) => {
        try {
          const parsed =
            typeof block.hue_color === "string"
              ? JSON.parse(block.hue_color)
              : block.hue_color;
          const hex = parsed?.color?.toUpperCase();
          return hexToLabelMap[hex] || null;
        } catch {
          return null;
        }
      })
      .filter(Boolean);

    setAvailableColors([...new Set(colors)].sort());
  };

  const filteredBlocks = blocks.filter((block) => {
    const blockDate = new Date(block.created_at).toISOString().split("T")[0];
    if (filterDate && blockDate !== filterDate) return false;

    if (filterColor) {
      try {
        const parsed =
          typeof block.hue_color === "string"
            ? JSON.parse(block.hue_color)
            : block.hue_color;
        const hex = parsed?.color?.toUpperCase();
        return hexToLabelMap[hex] === filterColor;
      } catch {
        return false;
      }
    }
    return true;
  });

  const totalGas = filteredBlocks.reduce(
    (sum, block) => sum + parseFloat(block.gas || 0),
    0
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-center items-center backdrop-blur-sm bg-black/30">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md shadow-lg p-6 relative max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Search Shared Block
          </h2>
          <button
            onClick={() => {
              setSearchQuery("");
              setBlocks([]);
              setShowPreview(false);
              setStartDate("");
              setEndDate("");
              setSearchPeriod("");
              setShowDateRange(false);
              onClose();
            }}
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
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-600 dark:text-white dark:border-gray-500"
              placeholder="Search title, description, or hash"
            />
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={() => setShowDateRange((prev) => !prev)}
              className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 rounded-lg text-sm font-medium"
            >
              {showDateRange ? "Hide Date Range" : "Show Date Range"}
            </button>
          </div>

          {showDateRange && (
            <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0">
              <div className="flex-1">
                <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-white">
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-600 dark:text-white dark:border-gray-500"
                />
              </div>
              <div className="flex-1">
                <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-white">
                  End Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-600 dark:text-white dark:border-gray-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-white">
              Search Period
            </label>
            <div className="flex flex-wrap gap-3 text-sm">
              {["weekly", "monthly", "quarterly", "yearly"].map((period) => (
                <label key={period} className="flex items-center gap-1">
                  <input
                    type="radio"
                    value={period}
                    checked={searchPeriod === period}
                    onChange={(e) => setSearchPeriod(e.target.value)}
                    disabled={showDateRange}
                  />
                  {period.charAt(0).toUpperCase() + period.slice(1)}
                </label>
              ))}
            </div>
          </div>

          {searchPeriod && (
            <div className="mt-2">
              <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-white">
                Anchor Position
              </label>
              <div className="flex gap-3 text-sm">
                {["start", "middle", "end"].map((anchor) => (
                  <label key={anchor} className="flex items-center gap-1">
                    <input
                      type="radio"
                      value={anchor}
                      checked={periodAnchor === anchor}
                      onChange={(e) => setPeriodAnchor(e.target.value)}
                    />
                    {anchor.charAt(0).toUpperCase() + anchor.slice(1)}
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="pt-4">
            <button
              type="submit"
              className="w-full bg-blue-700 hover:bg-blue-800 text-white py-2 rounded-lg text-sm font-medium"
            >
              Search Block
            </button>
          </div>
        </form>

        <button
          type="button"
          onClick={() => {
            setSearchQuery("");
            setBlocks([]);
            setShowPreview(false);
            setStartDate("");
            setEndDate("");
            setSearchPeriod("");
            setShowDateRange(false);
          }}
          className="w-full bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 rounded-lg text-sm font-medium mt-2"
        >
          Reset Search
        </button>

        <div className="mt-3 text-sm text-center text-gray-800 dark:text-white bg-green-100 dark:bg-green-900 p-2 rounded">
          <strong>Total Gas:</strong> {totalGas.toFixed(6)}
        </div>

        {loading && (
          <div className="text-center text-sm text-gray-500 dark:text-gray-300 mt-4">
            Searching...
          </div>
        )}

        {showPreview && filteredBlocks.length > 0 && (
          <div className="mt-6">
            <h3 className="text-md font-semibold mb-4 text-gray-800 dark:text-white">
              Matching Shared Blocks
            </h3>
            <div className="flex flex-wrap gap-4 justify-center max-h-[70vh] overflow-y-auto pr-2">
              {filteredBlocks.map((block, index) => (
                <SharedBlockCardPreview
                  key={block.id}
                  sr={block.block_sr || index + 1}
                  title={block.block_title}
                  description={block.block_desp}
                  hash={block.hash}
                  previousHash={block.previous_hash}
                  gas={parseFloat(block.gas).toFixed(6)}
                  timestamp={block.timestamp}
                  hue_color={block.hue_color}
                  data={block.block_files?.[0]?.name}
                  userName={block.user_name}
                  userAvatar={block.user_avatar}
                  userRole={block.user_role}
                  userDesignation={block.user_designation}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchSharedBlockModal;
