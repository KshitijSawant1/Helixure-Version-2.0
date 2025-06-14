import React from "react";
import { Handle } from "reactflow";
import BlockCard from "./BlockCard";

const CustomBlockNode = ({ data }) => {
  return (
    <div
      style={{
        width: 300,
        position: "relative",
        pointerEvents: "all",
        zIndex: 10,
      }}
    >
      {/* 🔵 Incoming handle */}
      <Handle
        type="target"
        position="top"
        id="a"
        style={{ background: "#10B981", width: 12, height: 12 }}
      />

      {/* 🧱 Custom block content */}
      <BlockCard
        id={data.id}
        sr={data.sr}
        title={data.title}
        description={data.description}
        hash={data.hash}
        previousHash={data.previousHash}
        gas={data.gas}
        data={data.data}
        timestamp={data.timestamp}
        hue_color={data.hue_color}
        blocks={[]}
        isFlowMode={true}
      />

      {/* 🔴 Outgoing handle */}
      <Handle
        type="source"
        position="bottom"
        id="b"
        style={{ background: "#EF4444", width: 12, height: 12 }}
      />
    </div>
  );
};

export default CustomBlockNode;