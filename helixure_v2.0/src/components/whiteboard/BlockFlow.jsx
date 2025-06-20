import React, { useMemo } from "react";
import ReactFlow, { Background, Controls, MiniMap } from "reactflow";
import "reactflow/dist/style.css";
import CustomBlockNode from "./CustomBlockNode";

const BlockFlow = ({ blocks }) => {
  // 🧠 1. NODES from Supabase blocks
  const CARD_WIDTH = 320; // width of one BlockCard + margin
  const CARD_HEIGHT = 250; // height of one BlockCard + margin
  const CARDS_PER_ROW = 5;

  const nodes = useMemo(() => {
    return blocks.map((block, index) => ({
      id: block.id.toString(),
      type: "custom",

      position: {
        x: (index % CARDS_PER_ROW) * CARD_WIDTH * 1.2, // apply multiplier here
        y: Math.floor(index / CARDS_PER_ROW) * CARD_HEIGHT * 1.5, // adjust as desired
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
      },
    }));
  }, [blocks]);

  // 🔗 2. EDGES between nodes based on hash ↔ previous_hash
  const edges = useMemo(() => {
    return blocks
      .map((block) => {
        const parent = blocks.find((b) => b.hash === block.previous_hash);
        if (!parent) return null;

        return {
          id: `e${parent.id}-${block.id}`, // ✅ fixed with backticks
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

  const nodeTypes = useMemo(() => ({ custom: CustomBlockNode }), []);

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
        elementsSelectable={true}
        selectNodesOnDrag={true}
        nodesDraggable={true}
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

export default BlockFlow;
