import React from "react";

const SimpleCubeAnimation = () => {
  const cubeStyle = {
    width: "60px",
    height: "60px",
    backgroundColor: "#4f46e5",
    transformStyle: "preserve-3d",
    animation: "spin 3s infinite linear",
    margin: "1rem auto",
  };

  const keyframes = `
    @keyframes spin {
      0% { transform: rotateX(0deg) rotateY(0deg); }
      100% { transform: rotateX(360deg) rotateY(360deg); }
    }
  `;

  return (
    <div>
      <style>{keyframes}</style>
      <div style={cubeStyle}></div>
    </div>
  );
};

export default SimpleCubeAnimation;
