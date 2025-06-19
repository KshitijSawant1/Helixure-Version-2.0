import React, { useMemo } from "react";
import ReactFlow, { Background, Controls, MiniMap } from "reactflow";
import "reactflow/dist/style.css";
import SharedCustomBlockNode from "./SharedCustomBlockNode";

const SharedBlockFlow = ({ blocks }) => {
  const CARD_WIDTH = 320;
  const CARD_HEIGHT = 220;
  const CARDS_PER_ROW = 5;

  // 🧠 Build nodes
  const nodes = useMemo(() => {
    return blocks.map((block, index) => ({
      id: block.id.toString(),
      type: "sharedCustom",
      position: {
        x: block.x ?? (index % CARDS_PER_ROW) * CARD_WIDTH,
        y: block.y ?? Math.floor(index / CARDS_PER_ROW) * CARD_HEIGHT,
      },
      data: {
        id: block.id,
        sr: block.block_sr,
        title: block.block_title,
        description: block.block_description,
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
    return blocks
      .map((block) => {
        const parent = blocks.find((b) => b.hash === block.previous_hash);
        if (!parent) return null;

        return {
          id: `e${parent.id}-${block.id}`,
          source: parent.id.toString(),
          sourceHandle: "b",
          target: block.id.toString(),
          targetHandle: "a",
          type: "smoothstep",
          animated: true,
          markerEnd: { type: "arrowclosed" },
          style: { stroke: "#3B82F6", strokeWidth: 2 },
        };
      })
      .filter(Boolean);
  }, [blocks]);

  const nodeTypes = useMemo(
    () => ({ sharedCustom: SharedCustomBlockNode }),
    []
  );

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
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
      </ReactFlow>
    </div>
  );
};

export default SharedBlockFlow;
