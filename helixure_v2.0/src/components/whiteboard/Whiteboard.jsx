import React, { useRef, useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import BlockCard from "./BlockCard";
import InstructionDrawer from "./InstructionDrawer";
import CreateBlockDrawer from "./CreateBlockDrawer";
import SearchBlockModal from "./SearchBlockModal";
import PoWGameModal from "./PoWGameModal";
import { supabase } from "../../supabaseClient";

const Whiteboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const spaceId = location.state?.spaceId;

  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activePanel, setActivePanel] = useState(null);
  const [showPoWModal, setShowPoWModal] = useState(false);
  const [pendingBlockCallback, setPendingBlockCallback] = useState(null);
  const [showGas, setShowGas] = useState(false);
  const [gasUsed, setGasUsed] = useState(0.000028);
  const [powGameName, setPowGameName] = useState(null);
  const [requirePoW, setRequirePoW] = useState(false);
  const [totalGasUsed, setTotalGasUsed] = useState("0.000000");

  const containerRef = useRef(null);

  // Toggle UI panels
  const togglePanel = (panel) =>
    setActivePanel((prev) => (prev === panel ? null : panel));

  // Toggle PoW mode
  const handleToggleGames = () => {
    setRequirePoW((prev) => {
      const newState = !prev;
      toast(newState ? "PoW Games Mode Enabled" : "PoW Games Mode Disabled");
      return newState;
    });
  };

  const handleToggleGas = () => {
    setShowGas((prev) => !prev);
  };

  const handlePoWBeforeBlockCreate = (callback) => {
    if (requirePoW) {
      setPendingBlockCallback(() => callback);
      setShowPoWModal(true);
    } else {
      setGasUsed(0.000028);
      setPowGameName("");
      callback(); // ⬅️ Use the callback directly
    }
  };

  // Called when PoW game is completed
  const handlePoWSuccess = (gas, gameName) => {
    setGasUsed(gas);
    setPowGameName(gameName);
    setShowPoWModal(false);
    if (pendingBlockCallback) {
      pendingBlockCallback(); // ✅ Call the pending callback
      setPendingBlockCallback(null); // 🔁 Reset it
    }
  };

  // Resize listener
  const [containerSize, setContainerSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      setContainerSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Clamp block positions within container
  const updatePosition = (id, x, y) => {
    const cardWidth = 288;
    const cardHeight = 160;

    const clampedX = Math.max(0, Math.min(containerSize.width - cardWidth, x));
    const clampedY = Math.max(
      0,
      Math.min(containerSize.height - cardHeight, y)
    );

    setBlocks((prev) =>
      prev.map((block) =>
        block.id === id ? { ...block, x: clampedX, y: clampedY } : block
      )
    );
  };

  // Fetch blocks from Supabase
  const fetchBlocks = async () => {
    setLoading(true);

    // Step 1: Fetch blocks
    const { data, error } = await supabase
      .from("space_block_table")
      .select("*")
      .eq("space_id", spaceId);

    if (error) {
      console.error("❌ Failed to fetch blocks:", error.message);
      return;
    }

    // Step 2: Set block positions
    const positionedBlocks = data.map((block, idx) => ({
      ...block,
      x: 100 + idx * 50,
      y: 100 + idx * 30,
    }));
    setBlocks(positionedBlocks);

    // ✅ Step 3: Calculate total gas
    const totalGas = parseFloat(
      data.reduce((sum, block) => sum + Number(block.gas), 0).toFixed(6)
    );
    setTotalGasUsed(totalGas.toFixed(6));

    setLoading(false);
  };

  useEffect(() => {
    if (!spaceId) {
      navigate("/playground");
    } else {
      fetchBlocks();
    }
  }, [spaceId]);

  // Lock scroll when a drawer is open
  useEffect(() => {
    document.body.style.overflow =
      activePanel === "instruction" || activePanel === "create" ? "hidden" : "";
  }, [activePanel]);

  // Temporary fallback if you don't yet generate paths dynamically
  const getLinePath = () => "";

  return (
    <div
      ref={containerRef}
      className="relative w-screen h-screen overflow-auto bg-gray-100"
    >
      {/* SVG Path Between Blocks */}
      <svg
        className="absolute top-0 left-0 w-full h-full z-0"
        style={{ pointerEvents: "none" }}
      >
        <defs>
          <marker
            id="arrow"
            viewBox="0 0 10 10"
            refX="10"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#3b82f6" />
          </marker>
        </defs>
        <path
          d={getLinePath()}
          stroke="#3b82f6"
          strokeWidth="3"
          fill="none"
          markerEnd="url(#arrow)"
        />
      </svg>

      {/* Render Block Cards */}
      {blocks.map((block) => (
        <BlockCard
          key={block.id}
          id={block.id} // used for React key & dragging
          sr={block.block_sr} // for display as Block No
          x={block.x}
          y={block.y}
          updatePosition={updatePosition}
          blocks={blocks}
          title={block.block_title}
          description={block.block_description}
          hash={block.hash}
          previousHash={block.previous_hash}
          hue_color={block.hue_color}
          gas={Number(block.gas).toFixed(6)}
          data={block.block_files?.[0]?.name || "No file attached"}
          timestamp={block.timestamp}
        />
      ))}
      <div className="relative w-full max-w-lg mx-auto">
        {showGas && (
          <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-50">
            <div
              className="bg-white text-gray-800 font-mono px-6 py-2 text-sm shadow-md "
              style={{
                clipPath: "polygon(10% 0%, 90% 0%, 100% 100%, 0% 100%)",
                WebkitClipPath: "polygon(10% 0%, 90% 0%, 100% 100%, 0% 100%)",
              }}
            >
              Gas Used:{" "}
              <span className="font-bold text-blue-600">{totalGasUsed}</span>
            </div>
          </div>
        )}
        {/* Loading Spinner */}
        {loading && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center backdrop-blur-sm bg-white/40 transition-opacity duration-300">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
              <div className="absolute inset-1 rounded-full bg-white"></div>
            </div>
          </div>
        )}

        <div className="fixed z-50 w-full h-16 max-w-lg -translate-x-1/2 bg-white border border-gray-200 rounded-full bottom-4 left-1/2 dark:bg-gray-700 dark:border-gray-600">
          <div className="grid h-full max-w-lg grid-cols-5 mx-auto">
            <button
              data-tooltip-target="tooltip-info"
              onClick={() => togglePanel("instruction")}
              type="button"
              className="inline-flex flex-col items-center justify-center px-5 rounded-s-full hover:bg-gray-50 dark:hover:bg-gray-800 group"
            >
              <svg
                className="w-6 h-6 text-gray-800 dark:text-white"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  fillRule="evenodd"
                  d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12Zm9.408-5.5a1 1 0 1 0 0 2h.01a1 1 0 1 0 0-2h-.01ZM10 10a1 1 0 1 0 0 2h1v3h-1a1 1 0 1 0 0 2h4a1 1 0 1 0 0-2h-1v-4a1 1 0 0 0-1-1h-2Z"
                  clipRule="evenodd"
                />
              </svg>

              <span className="sr-only">info</span>
            </button>
            <div
              id="tooltip-info"
              role="tooltip"
              className="absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-white transition-opacity duration-300 bg-gray-900 rounded-lg shadow-xs opacity-0 tooltip dark:bg-gray-700"
            >
              Info
              <div className="tooltip-arrow" data-popper-arrow></div>
            </div>

            <button
              data-tooltip-target="tooltip-search"
              type="button"
              onClick={() => togglePanel("search")}
              className="inline-flex flex-col items-center justify-center px-5 hover:bg-gray-50 dark:hover:bg-gray-800 group"
            >
              <svg
                className="w-6 h-6 text-gray-800 dark:text-white"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M10 2a8 8 0 1 0 0 16 8 8 0 0 0 0-16Z" />
                <path
                  fillRule="evenodd"
                  d="M21.707 21.707a1 1 0 0 1-1.414 0l-3.5-3.5a1 1 0 0 1 1.414-1.414l3.5 3.5a1 1 0 0 1 0 1.414Z"
                  clipRule="evenodd"
                />
              </svg>

              <span className="sr-only">Search</span>
            </button>
            <div
              id="tooltip-search"
              role="tooltip"
              className="absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-white transition-opacity duration-300 bg-gray-900 rounded-lg shadow-xs opacity-0 tooltip dark:bg-gray-700"
            >
              Search
              <div className="tooltip-arrow" data-popper-arrow></div>
            </div>
            <div className="flex items-center justify-center">
              <button
                data-tooltip-target="tooltip-new"
                type="button"
                onClick={() =>
                  setActivePanel((prev) =>
                    prev === "create" ? null : "create"
                  )
                }
                className="inline-flex items-center justify-center w-10 h-10 font-medium bg-blue-600 rounded-full hover:bg-blue-700 group focus:ring-4 focus:ring-blue-300 focus:outline-none dark:focus:ring-blue-800"
              >
                <svg
                  className="w-4 h-4 text-white"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 18 18"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 1v16M1 9h16"
                  />
                </svg>
                <span className="sr-only">New item</span>
              </button>
            </div>
            <div
              id="tooltip-new"
              role="tooltip"
              className="absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-white transition-opacity duration-300 bg-gray-900 rounded-lg shadow-xs opacity-0 tooltip dark:bg-gray-700"
            >
              Create New Block
              <div className="tooltip-arrow" data-popper-arrow></div>
            </div>
            <button
              onClick={handleToggleGas}
              data-tooltip-target="tooltip-gas"
              type="button"
              className="inline-flex flex-col items-center justify-center px-5 hover:bg-gray-50 dark:hover:bg-gray-800 group"
            >
              <svg
                className={`w-6 h-6 ${
                  showGas ? "text-green-600" : "text-red-600"
                } dark:text-white`}
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M18.045 3.007 12.31 3a1.965 1.965 0 0 0-1.4.585l-7.33 7.394a2 2 0 0 0 0 2.805l6.573 6.631a1.957 1.957 0 0 0 1.4.585 1.965 1.965 0 0 0 1.4-.585l7.409-7.477A2 2 0 0 0 21 11.479v-5.5a2.972 2.972 0 0 0-2.955-2.972Zm-2.452 6.438a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z" />
              </svg>

              <span className="sr-only">gas</span>
            </button>
            <div
              id="tooltip-gas"
              role="tooltip"
              className="absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-white transition-opacity duration-300 bg-gray-900 rounded-lg shadow-xs opacity-0 tooltip dark:bg-gray-700"
            >
              Gas
              <div className="tooltip-arrow" data-popper-arrow></div>
            </div>
            <button
              onClick={handleToggleGames}
              type="button"
              data-tooltip-target="tooltip-games"
              className="inline-flex flex-col items-center justify-center px-5 rounded-e-full hover:bg-gray-50 dark:hover:bg-gray-800 group"
            >
              <svg
                className={`w-6 h-6 ${
                  requirePoW ? "text-green-600" : "text-red-600"
                } dark:text-white`}
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12.8638 3.49613C12.6846 3.18891 12.3557 3 12 3s-.6846.18891-.8638.49613l-3.49998 6c-.18042.30929-.1817.69147-.00336 1.00197S8.14193 11 8.5 11h7c.3581 0 .6888-.1914.8671-.5019.1784-.3105.1771-.69268-.0033-1.00197l-3.5-6ZM4 13c-.55228 0-1 .4477-1 1v6c0 .5523.44772 1 1 1h6c.5523 0 1-.4477 1-1v-6c0-.5523-.4477-1-1-1H4Zm12.5-1c-2.4853 0-4.5 2.0147-4.5 4.5s2.0147 4.5 4.5 4.5 4.5-2.0147 4.5-4.5-2.0147-4.5-4.5-4.5Z" />
              </svg>

              <span className="sr-only">Games</span>
            </button>
            <div
              id="tooltip-games"
              role="tooltip"
              className="absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-white transition-opacity duration-300 bg-gray-900 rounded-lg shadow-sm opacity-0 tooltip dark:bg-gray-700"
            >
              Games
              <div className="tooltip-arrow" data-popper-arrow></div>
            </div>
          </div>
        </div>
      </div>
      <InstructionDrawer
        isOpen={activePanel === "instruction"}
        onClose={() => setActivePanel(null)}
        spaceId={spaceId}
      />
      <SearchBlockModal
        isOpen={activePanel === "search"}
        onClose={() => setActivePanel(null)}
        onSearch={(query) => {
          console.log("Searching for:", query);
        }}
      />
      <PoWGameModal
        isOpen={showPoWModal}
        onSuccess={handlePoWSuccess}
        onClose={() => setShowPoWModal(false)}
      />

      <CreateBlockDrawer
        isOpen={activePanel === "create"}
        onClose={() => setActivePanel(null)}
        spaceId={spaceId}
        onSuccess={fetchBlocks}
        requirePoW={requirePoW}
        gasUsed={gasUsed}
        powGameName={powGameName}
      />
    </div>
  );
};

export default Whiteboard;
