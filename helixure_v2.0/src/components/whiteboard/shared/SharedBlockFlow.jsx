import React, { useMemo, useEffect, useState } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useReactFlow,
} from "reactflow";
import "reactflow/dist/style.css";
import SharedCustomBlockNode from "./SharedCustomBlockNode";
const SharedBlockFlow = ({ blocks, supplementaryLinks = [] }) => {
  const [linkFilter, setLinkFilter] = useState("all"); // all, normal, supplementary
  const CARD_WIDTH = 320;
  const CARD_HEIGHT = 220;
  const CARDS_PER_ROW = 5;
  const { fitView } = useReactFlow();

  const nodes = useMemo(() => {
    return blocks.map((block, index) => ({
      id: block.id.toString(),
      type: "sharedCustom",
      position: {
        x:
          block.x !== undefined
            ? block.x
            : (index % CARDS_PER_ROW) * CARD_WIDTH * 1.2, // adjustable multiplier
        y:
          block.y !== undefined
            ? block.y
            : Math.floor(index / CARDS_PER_ROW) * CARD_HEIGHT * 2, // adjustable multiplier
      },
      data: {
        id: block.id,
        sr: block.block_sr,
        title: block.block_title,
        description:
          block.block_description ||
          block.block_desp ||
          "No description provided.",
        hash: block.hash,
        previousHash: block.previous_hash,
        gas: block.gas,
        data: block.block_files?.[0]?.name || "No file attached",
        timestamp: block.timestamp,
        hue_color: block.hue_color,
        userName: block.user_name || "Anonymous",
        userAvatar: block.user_avatar || null,
        userRole: block.user_role || "Viewer",
        userDesignation: block.user_designation || "Member",
      },
    }));
  }, [blocks]);

  // 🔗 Build edges
  const edges = useMemo(() => {
    const baseEdges = blocks
      .map((block) => {
        const parent = blocks.find((b) => b.hash === block.previous_hash);
        if (!parent) return null;
        return {
          id: `e${parent.id}-${block.id}`,
          source: parent.id.toString(),
          target: block.id.toString(),
          sourceHandle: "b",
          targetHandle: "a",
          type: "smoothstep",
          animated: true,
          markerEnd: { type: "arrowclosed" },
          style: { stroke: "#1E429F", strokeWidth: 3, strokeDasharray: "6 4" },
        };
      })
      .filter(Boolean);
    const extraEdges = supplementaryLinks
      .filter((link) => link.source_block_id && link.target_block_id)
      .map((link, index) => ({
        id: `s${link.source_block_id}-${link.target_block_id}-${
          link.id || index
        }`, // append DB id or fallback to index
        source: link.source_block_id.toString(),
        target: link.target_block_id.toString(),
        sourceHandle: "right",
        targetHandle: "left",
        type: "smoothstep",
        animated: true,
        markerEnd: { type: "arrowclosed" },
        style: {
          stroke: "#1C64F2",
          strokeWidth: 3,
          strokeDasharray: "none",
        },
      }));

    if (linkFilter === "normal") return baseEdges;
    if (linkFilter === "supplementary") return extraEdges;
    return [...baseEdges, ...extraEdges];
  }, [blocks, supplementaryLinks, linkFilter]);

  const nodeTypes = useMemo(
    () => ({ sharedCustom: SharedCustomBlockNode }),
    []
  );

  // Call fitView ONCE (optional, you can remove this useEffect if not needed)
  useEffect(() => {
    fitView();
  }, [fitView]);

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        // Removed fitView prop
        panOnDrag
        zoomOnScroll
        zoomOnPinch
        panOnScroll
        elementsSelectable
        selectNodesOnDrag
        nodesDraggable
        defaultViewport={{ x: 0, y: 0, zoom: 1 }}
      >
        <Background gap={16} />
        <Controls position="top-left" />
        <MiniMap
          position="top-right"
          nodeColor={() => "#A0AEC0"}
          style={{
            backgroundColor: "#f5f5f5",
            border: "1px solid #D1D5DB",
            borderRadius: "2px",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 170, // position below the MiniMap
            right: 10, // align right with MiniMap
            zIndex: 20,
          }}
        >
          <div
            className="inline-flex rounded-md shadow-sm bg-white"
            role="group"
          >
            <button
              type="button"
              onClick={() => setLinkFilter("all")}
              className={`px-4 py-2 text-sm font-medium border border-gray-900 ${
                linkFilter === "all"
                  ? "bg-gray-900 text-white"
                  : "bg-transparent text-gray-900 hover:bg-gray-900 hover:text-white"
              } rounded-s-lg focus:z-10 focus:ring-2 focus:ring-gray-500`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setLinkFilter("normal")}
              className={`px-4 py-2 text-sm font-medium border-t border-b border-gray-900 ${
                linkFilter === "normal"
                  ? "bg-gray-900 text-white"
                  : "bg-transparent text-gray-900 hover:bg-gray-900 hover:text-white"
              } focus:z-10 focus:ring-2 focus:ring-gray-500`}
            >
              Chain
            </button>
            <button
              type="button"
              onClick={() => setLinkFilter("supplementary")}
              className={`px-4 py-2 text-sm font-medium border border-gray-900 ${
                linkFilter === "supplementary"
                  ? "bg-gray-900 text-white"
                  : "bg-transparent text-gray-900 hover:bg-gray-900 hover:text-white"
              } rounded-e-lg focus:z-10 focus:ring-2 focus:ring-gray-500`}
            >
              Custom
            </button>
          </div>
        </div>
      </ReactFlow>
    </div>
  );
};

export default SharedBlockFlow;
