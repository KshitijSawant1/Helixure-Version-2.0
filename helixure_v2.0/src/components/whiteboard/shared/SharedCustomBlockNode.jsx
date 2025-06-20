import React from "react";
import { Handle } from "reactflow";
import SharedBlockCard from "./SharedBlockCard";

const SharedCustomBlockNode = ({ data }) => {
  return (
    <div
      style={{
        width: 300,
        position: "relative",
        pointerEvents: "all",
        zIndex: 10,
      }}
    >
      {/* Incoming handle */}
      <Handle
        type="target"
        position="top"
        id="a"
        style={{
          background: "#10B981",
          width: 12,
          height: 12,
          borderRadius: "50%",
        }}
      />
      <Handle
        type="source"
        position="right"
        id="right"
        style={{
          background: "#F59E0B",
          width: 10,
          height: 10,
          borderRadius: "50%",
          right: 7, // ⬅ ensure it's flush to the right edge
          top: "50%", // center vertically (optional if not done)
          transform: "translateY(-50%)", // perfect vertical centering
        }}
      />

      {/* Shared block card view with full user attribution */}
      <SharedBlockCard
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
        isFlowMode={true}
        // 🧠 User Attribution (Creator of block)
        userName={data.userName || "Anonymous"}
        userAvatar={data.userAvatar || null}
        userRole={data.userRole || "Viewer"}
        userDesignation={data.userDesignation || "Member"}
      />

      {/* Outgoing handle */}
      <Handle
        type="source"
        position="bottom"
        id="b"
        style={{
          background: "#EF4444",
          width: 12,
          height: 12,
          borderRadius: "50%",
        }}
      />

      <Handle
        type="target"
        position="left"
        id="left"
        style={{
          background: "#F59E0B",
          width: 10,
          height: 10,
          borderRadius: "50%",
        }}
      />
    </div>
  );
};

export default SharedCustomBlockNode;
