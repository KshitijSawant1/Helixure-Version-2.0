import React, { useRef, useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import BlockCard from "./BlockCard";
import InstructionDrawer from "./InstructionDrawer";
import InstructionModal from "./InstructionModal";
import CreateBlockDrawer from "./CreateBlockDrawer";
import SearchBlockModal from "./SearchBlockModal";
import PoWGameModal from "./PoWGameModal";
import SharedInstructionModal from "./shared/SharedIntructionModal";
import SharedInstructionDrawer from "./shared/SharedIntructionDrawer";
import EditSpace from "./shared/EditSpace";
import { supabase } from "../../supabaseClient";
import BlockFlow from "./BlockFlow";
import { ReactFlowProvider } from "reactflow";

const Whiteboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const spaceId = location.state?.spaceId;

  const [viewMode, setViewMode] = useState("cards"); // "cards" or "flow"
  const [blocks, setBlocks] = useState([]); // 👈 Define blocks with state
  const [loading, setLoading] = useState(true);
  const [activePanel, setActivePanel] = useState(null);
  const [showPoWModal, setShowPoWModal] = useState(false);
  const [pendingBlockCallback, setPendingBlockCallback] = useState(null);
  const [showGas, setShowGas] = useState(false);
  const [gasUsed, setGasUsed] = useState(0.000028);
  const [powGameName, setPowGameName] = useState(null);
  const [requirePoW, setRequirePoW] = useState(false);
  const [totalGasUsed, setTotalGasUsed] = useState("0.000000");
  const [showInstructionModal, setShowInstructionModal] = useState(false);
  const [showEditSpace, setShowEditSpace] = useState(false);
  const [showChatLog, setShowChatLog] = useState(false);
  const [showAddLink, setShowAddLink] = useState(false);
  const [showChatBot, setShowChatBot] = useState(false);
  const [spaceType, setSpaceType] = useState(null);
  const [showSharedInstructionModal, setShowSharedInstructionModal] =
    useState(false);
  const [showSharedInstructionDrawer, setShowSharedInstructionDrawer] =
    useState(false);
  const [userRole, setUserRole] = useState("Viewer");

  const containerRef = useRef(null);

  const fetchSpaceType = async () => {
    if (!spaceId) return;

    // Check private space
    const { data: privateData } = await supabase
      .from("playground")
      .select("id")
      .eq("id", spaceId)
      .maybeSingle();

    if (privateData) {
      setSpaceType("Private");
      return;
    }

    // Check shared space
    const { data: sharedData } = await supabase
      .from("shared_playground")
      .select("id")
      .eq("id", spaceId)
      .maybeSingle();

    if (sharedData) {
      setSpaceType("Shared");
      return;
    }

    // If space not found
    toast.error("Invalid space ID");
    navigate("/playground");
  };

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
    const CARD_WIDTH = 288;
    const CARD_HEIGHT = 200;
    const GAP_X = 40; // ⬅️ horizontal gap between cards
    const GAP_Y = 120; // ⬅️ vertical gap between cards
    const CARDS_PER_ROW = 5;
    const OFFSET_X = 10;
    const OFFSET_Y = 10;

    const positionedBlocks = data.map((block, idx) => ({
      ...block,
      x: OFFSET_X + (idx % CARDS_PER_ROW) * (CARD_WIDTH + GAP_X),
      y: OFFSET_Y + Math.floor(idx / CARDS_PER_ROW) * (CARD_HEIGHT + GAP_Y),
    }));

    setBlocks(positionedBlocks); // ✅ Add this line

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
    const shouldLockScroll =
      activePanel === "instruction" ||
      activePanel === "create" ||
      activePanel === "shared-instruction" ||
      activePanel === "editSpace";

    document.body.style.overflow = shouldLockScroll ? "hidden" : "";
  }, [activePanel]);

  // Temporary fallback if you don't yet generate paths dynamically
  const getLinePath = () => "";
  const checkSpaceEntry = async () => {
    if (!spaceId || !spaceType) return;

    const table = spaceType === "Shared" ? "shared_playground" : "playground";

    const { data, error } = await supabase
      .from(table)
      .select("total_gas")
      .eq("id", spaceId)
      .maybeSingle();

    if (error) {
      console.error(`Error fetching space info from ${table}:`, error.message);
      toast.error("Error fetching space info");
      return;
    }

    if (!data) {
      toast.error("Space not found");
      navigate("/playground");
      return;
    }

    if (data.total_gas === 0) {
      const seen = sessionStorage.getItem(`seenInstructions-${spaceId}`);
      if (!seen) {
        if (spaceType === "Private") {
          setShowInstructionModal(true);
        } else if (spaceType === "Shared") {
          setShowSharedInstructionModal(true);
        }
        sessionStorage.setItem(`seenInstructions-${spaceId}`, "true");
      }
    }
  };
  const checkMembership = async () => {
    if (spaceType !== "Shared") return;

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      toast.error("User authentication failed");
      navigate("/playground");
      return;
    }

    const { data, error } = await supabase
      .from("shared_playground_members")
      .select("*")
      .eq("space_id", spaceId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (error || !data) {
      toast.error("You are not a member of this shared space");
      navigate("/playground");
      return;
    }

    // Optionally store user role for EditSpace
    setUserRole(data.role);
  };
  useEffect(() => {
    if (spaceId && spaceType === "Shared") {
      checkMembership();
    }
  }, [spaceId, spaceType]);
  useEffect(() => {
    if (spaceId) {
      fetchSpaceType(); // this sets spaceType
    }
  }, [spaceId]);

  useEffect(() => {
    if (spaceId && spaceType) {
      checkSpaceEntry();
    }
  }, [spaceId, spaceType]);

  useEffect(() => {
    const savedMode = sessionStorage.getItem("viewMode");
    if (savedMode) setViewMode(savedMode);
  }, []);

  useEffect(() => {
    sessionStorage.setItem("viewMode", viewMode);
  }, [viewMode]);

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
      {viewMode === "cards" ? (
        blocks.map((block) => (
          <BlockCard
            key={block.id}
            id={block.id}
            sr={block.block_sr}
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
        ))
      ) : (
        <div className="w-screen h-[calc(100vh-64px)] relative z-10">
          <ReactFlowProvider>
            <BlockFlow blocks={blocks} setBlocks={setBlocks} />
          </ReactFlowProvider>
        </div>
      )}

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

        {spaceType === "Private" && (
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
                    d="M9.586 2.586A2 2 0 0 1 11 2h2a2 2 0 0 1 2 2v.089l.473.196.063-.063a2.002 2.002 0 0 1 2.828 0l1.414 1.414a2 2 0 0 1 0 2.827l-.063.064.196.473H20a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-.089l-.196.473.063.063a2.002 2.002 0 0 1 0 2.828l-1.414 1.414a2 2 0 0 1-2.828 0l-.063-.063-.473.196V20a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2v-.089l-.473-.196-.063.063a2.002 2.002 0 0 1-2.828 0l-1.414-1.414a2 2 0 0 1 0-2.827l.063-.064L4.089 15H4a2 2 0 0 1-2-2v-2a2 2 0 0 1 2-2h.09l.195-.473-.063-.063a2 2 0 0 1 0-2.828l1.414-1.414a2 2 0 0 1 2.827 0l.064.063L9 4.089V4a2 2 0 0 1 .586-1.414ZM8 12a4 4 0 1 1 8 0 4 4 0 0 1-8 0Z"
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
                onClick={() =>
                  setViewMode(viewMode === "cards" ? "flow" : "cards")
                }
                type="button"
                data-tooltip-target="tooltip-view"
                className="inline-flex flex-col items-center justify-center px-5 hover:bg-gray-50 dark:hover:bg-gray-800 group"
              >
                {viewMode === "cards" ? (
                  // Cards → Flow view (show flow icon)
                  <svg
                    className="w-6 h-6 text-gray-800 dark:text-white"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M8 3a3 3 0 0 0-1 5.83v6.34a3.001 3.001 0 1 0 2 0V15a2 2 0 0 1 2-2h1a5.002 5.002 0 0 0 4.927-4.146A3.001 3.001 0 0 0 16 3a3 3 0 0 0-1.105 5.79A3.001 3.001 0 0 1 12 11h-1c-.729 0-1.412.195-2 .535V8.83A3.001 3.001 0 0 0 8 3Z" />
                  </svg>
                ) : (
                  // Flow → Cards view (show card icon)
                  <svg
                    className="w-6 h-6 text-gray-800 dark:text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5 3a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7.414A2 2 0 0 0 20.414 6L18 3.586A2 2 0 0 0 16.586 3H5Zm10 11a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM8 7V5h8v2a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1Z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
                <span className="sr-only">Switch View</span>
              </button>

              <div
                id="tooltip-view"
                role="tooltip"
                className="absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-white transition-opacity duration-300 bg-gray-900 rounded-lg shadow-xs opacity-0 tooltip dark:bg-gray-700"
              >
                {viewMode === "cards" ? "Flow View" : "Cards View"}
                <div className="tooltip-arrow" data-popper-arrow></div>
              </div>

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
        )}

        {spaceType === "Shared" && (
          <div className="fixed z-50 w-full h-16 max-w-lg -translate-x-1/2 bg-white border border-gray-200 rounded-full bottom-4 left-1/2 dark:bg-gray-700 dark:border-gray-600">
            <div className="grid h-full max-w-lg grid-cols-8 mx-auto">
              <button
                data-tooltip-target="tooltip-shared-instruction"
                onClick={() => setActivePanel("shared-instruction")}
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
                  <path d="M3 4.92857C3 3.90506 3.80497 3 4.88889 3H19.1111C20.195 3 21 3.90506 21 4.92857V13h-3v-2c0-.5523-.4477-1-1-1h-4c-.5523 0-1 .4477-1 1v2H3V4.92857ZM3 15v1.0714C3 17.0949 3.80497 18 4.88889 18h3.47608L7.2318 19.3598c-.35356.4243-.29624 1.0548.12804 1.4084.42428.3536 1.05484.2962 1.40841-.128L10.9684 18h2.0632l2.2002 2.6402c.3535.4242.9841.4816 1.4084.128.4242-.3536.4816-.9841.128-1.4084L15.635 18h3.4761C20.195 18 21 17.0949 21 16.0714V15H3Z" />
                  <path d="M16 12v1h-2v-1h2Z" />
                </svg>

                <span className="sr-only">instruction</span>
              </button>
              <div
                id="tooltip-shared-instruction"
                role="tooltip"
                className="absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-white transition-opacity duration-300 bg-gray-900 rounded-lg shadow-xs opacity-0 tooltip dark:bg-gray-700"
              >
                Instruction
                <div className="tooltip-arrow" data-popper-arrow></div>
              </div>

              <button
                data-tooltip-target="tooltip-shared-edit"
                type="button"
                onClick={() => togglePanel("editSpace")}
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
                  <path
                    fillRule="evenodd"
                    d="M9.586 2.586A2 2 0 0 1 11 2h2a2 2 0 0 1 2 2v.089l.473.196.063-.063a2.002 2.002 0 0 1 2.828 0l1.414 1.414a2 2 0 0 1 0 2.827l-.063.064.196.473H20a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-.089l-.196.473.063.063a2.002 2.002 0 0 1 0 2.828l-1.414 1.414a2 2 0 0 1-2.828 0l-.063-.063-.473.196V20a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2v-.089l-.473-.196-.063.063a2.002 2.002 0 0 1-2.828 0l-1.414-1.414a2 2 0 0 1 0-2.827l.063-.064L4.089 15H4a2 2 0 0 1-2-2v-2a2 2 0 0 1 2-2h.09l.195-.473-.063-.063a2 2 0 0 1 0-2.828l1.414-1.414a2 2 0 0 1 2.827 0l.064.063L9 4.089V4a2 2 0 0 1 .586-1.414ZM8 12a4 4 0 1 1 8 0 4 4 0 0 1-8 0Z"
                    clipRule="evenodd"
                  />
                </svg>

                <span className="sr-only">edit</span>
              </button>
              <div
                id="tooltip-shared-edit"
                role="tooltip"
                className="absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-white transition-opacity duration-300 bg-gray-900 rounded-lg shadow-xs opacity-0 tooltip dark:bg-gray-700"
              >
                Edit
                <div className="tooltip-arrow" data-popper-arrow></div>
              </div>

              <button
                data-tooltip-target="tooltip-shared-search"
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

                <span className="sr-only">search</span>
              </button>
              <div
                id="tooltip-shared-search"
                role="tooltip"
                className="absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-white transition-opacity duration-300 bg-gray-900 rounded-lg shadow-xs opacity-0 tooltip dark:bg-gray-700"
              >
                Search
                <div className="tooltip-arrow" data-popper-arrow></div>
              </div>

              <div className="flex items-center justify-center">
                <button
                  data-tooltip-target="tooltip-shared-create"
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
                  <span className="sr-only">Create</span>
                </button>
              </div>
              <div
                id="tooltip-shared-create"
                role="tooltip"
                className="absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-white transition-opacity duration-300 bg-gray-900 rounded-lg shadow-xs opacity-0 tooltip dark:bg-gray-700"
              >
                Create New Block
                <div className="tooltip-arrow" data-popper-arrow></div>
              </div>

              <div className="flex items-center justify-center">
                <button
                  data-tooltip-target="tooltip-shared-link"
                  type="button"
                  onClick={() =>
                    setActivePanel((prev) =>
                      prev === "create" ? null : "create"
                    )
                  }
                  className="inline-flex items-center justify-center w-10 h-10 font-medium bg-blue-600 rounded-full hover:bg-blue-700 group focus:ring-4 focus:ring-blue-300 focus:outline-none dark:focus:ring-blue-800"
                >
                  <svg
                    className="w-6 h-6 text-white dark:text-white"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13.213 9.787a3.391 3.391 0 0 0-4.795 0l-3.425 3.426a3.39 3.39 0 0 0 4.795 4.794l.321-.304m-.321-4.49a3.39 3.39 0 0 0 4.795 0l3.424-3.426a3.39 3.39 0 0 0-4.794-4.795l-1.028.961"
                    />
                  </svg>

                  <span className="sr-only">Link</span>
                </button>
              </div>
              <div
                id="tooltip-shared-link"
                role="tooltip"
                className="absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-white transition-opacity duration-300 bg-gray-900 rounded-lg shadow-xs opacity-0 tooltip dark:bg-gray-700"
              >
                Link Block
                <div className="tooltip-arrow" data-popper-arrow></div>
              </div>

              <button
                onClick={() =>
                  setViewMode(viewMode === "cards" ? "flow" : "cards")
                }
                type="button"
                data-tooltip-target="tooltip-shared-view"
                className="inline-flex flex-col items-center justify-center px-5 hover:bg-gray-50 dark:hover:bg-gray-800 group"
              >
                {viewMode === "cards" ? (
                  // Cards → Flow view (show flow icon)
                  <svg
                    className="w-6 h-6 text-gray-800 dark:text-white"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M8 3a3 3 0 0 0-1 5.83v6.34a3.001 3.001 0 1 0 2 0V15a2 2 0 0 1 2-2h1a5.002 5.002 0 0 0 4.927-4.146A3.001 3.001 0 0 0 16 3a3 3 0 0 0-1.105 5.79A3.001 3.001 0 0 1 12 11h-1c-.729 0-1.412.195-2 .535V8.83A3.001 3.001 0 0 0 8 3Z" />
                  </svg>
                ) : (
                  // Flow → Cards view (show card icon)
                  <svg
                    className="w-6 h-6 text-gray-800 dark:text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5 3a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7.414A2 2 0 0 0 20.414 6L18 3.586A2 2 0 0 0 16.586 3H5Zm10 11a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM8 7V5h8v2a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1Z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
                <span className="sr-only">Switch View</span>
              </button>
              <div
                id="tooltip-shared-view"
                role="tooltip"
                className="absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-white transition-opacity duration-300 bg-gray-900 rounded-lg shadow-xs opacity-0 tooltip dark:bg-gray-700"
              >
                {viewMode === "cards" ? "Flow View" : "Cards View"}
                <div className="tooltip-arrow" data-popper-arrow></div>
              </div>

              <button
                data-tooltip-target="tooltip-shared-chat"
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
                  <path
                    fillRule="evenodd"
                    d="M4 3a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h1v2a1 1 0 0 0 1.707.707L9.414 13H15a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1H4Z"
                    clipRule="evenodd"
                  />
                  <path
                    fillRule="evenodd"
                    d="M8.023 17.215c.033-.03.066-.062.098-.094L10.243 15H15a3 3 0 0 0 3-3V8h2a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1h-1v2a1 1 0 0 1-1.707.707L14.586 18H9a1 1 0 0 1-.977-.785Z"
                    clipRule="evenodd"
                  />
                </svg>

                <span className="sr-only">Chat</span>
              </button>
              <div
                id="tooltip-shared-chat"
                role="tooltip"
                className="absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-white transition-opacity duration-300 bg-gray-900 rounded-lg shadow-xs opacity-0 tooltip dark:bg-gray-700"
              >
                Chat
                <div className="tooltip-arrow" data-popper-arrow></div>
              </div>

              <button
                onClick={handleToggleGames}
                type="button"
                data-tooltip-target="tooltip-shared-bot"
                className="inline-flex flex-col items-center justify-center px-5 rounded-e-full hover:bg-gray-50 dark:hover:bg-gray-800 group"
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
                    d="M20.337 3.664c.213.212.354.486.404.782.294 1.711.657 5.195-.906 6.76-1.77 1.768-8.485 5.517-10.611 6.683a.987.987 0 0 1-1.176-.173l-.882-.88-.877-.884a.988.988 0 0 1-.173-1.177c1.165-2.126 4.913-8.841 6.682-10.611 1.562-1.563 5.046-1.198 6.757-.904.296.05.57.191.782.404ZM5.407 7.576l4-.341-2.69 4.48-2.857-.334a.996.996 0 0 1-.565-1.694l2.112-2.111Zm11.357 7.02-.34 4-2.111 2.113a.996.996 0 0 1-1.69-.565l-.422-2.807 4.563-2.74Zm.84-6.21a1.99 1.99 0 1 1-3.98 0 1.99 1.99 0 0 1 3.98 0Z"
                    clipRule="evenodd"
                  />
                </svg>

                <span className="sr-only">Bot</span>
              </button>
              <div
                id="tooltip-shared-bot"
                role="tooltip"
                className="absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-white transition-opacity duration-300 bg-gray-900 rounded-lg shadow-sm opacity-0 tooltip dark:bg-gray-700"
              >
                Bot
                <div className="tooltip-arrow" data-popper-arrow></div>
              </div>
            </div>
          </div>
        )}
      </div>
      <InstructionDrawer
        isOpen={activePanel === "instruction"}
        onClose={() => setActivePanel(null)}
        spaceId={spaceId}
        showGas={showGas}
        toggleGas={handleToggleGas}
      />
      <SearchBlockModal
        isOpen={activePanel === "search"}
        onClose={() => setActivePanel(null)}
        onSearch={(query) => {
          console.log("Searching for:", query);
        }}
        spaceId={spaceId}
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
      <SharedInstructionDrawer
        isOpen={activePanel === "shared-instruction"}
        onClose={() => setActivePanel(null)}
        spaceId={spaceId}
        showGas={showGas}
        toggleGas={handleToggleGas}
      />

      {showInstructionModal && (
        <InstructionModal onClose={() => setShowInstructionModal(false)} />
      )}
      {showSharedInstructionModal && (
        <SharedInstructionModal
          isOpen={showSharedInstructionModal}
          onClose={() => setShowSharedInstructionModal(false)}
        />
      )}
      <EditSpace
        isOpen={activePanel === "editSpace"}
        onClose={() => setActivePanel(null)}
        spaceId={spaceId}
        showGas={showGas}
        toggleGas={handleToggleGas}
        togglePow={handleToggleGames}
        userRole={userRole} // dynamic role!
      />
    </div>
  );
};

export default Whiteboard;
