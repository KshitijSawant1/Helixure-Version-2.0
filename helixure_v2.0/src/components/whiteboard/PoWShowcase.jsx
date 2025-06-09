import React, { useEffect } from "react";
import { gsap } from "gsap";
import { Draggable } from "gsap/Draggable";
import { InertiaPlugin } from "gsap/InertiaPlugin";

gsap.registerPlugin(Draggable, InertiaPlugin);

const PoWShowcase = () => {
  useEffect(() => {
    Draggable.create(".flair--1", {
      type: "x",
      bounds: ".container",
    });

    Draggable.create(".flair--3b", {
      type: "rotation",
      inertia: true,
    });

    Draggable.create(".flair--4b", {
      bounds: ".container",
      inertia: true,
    });
  }, []);

  return (
    <div className="relative w-full max-w-xl h-56 bg-blue-100 rounded-xl overflow-hidden flex items-center justify-around container mx-auto p-4">
      <div className="wrapper">
        <div className="flair flair--1 bg-red-400 rounded-full" />
      </div>
      <div className="wrapper">
        <div className="flair flair--3b" />
      </div>
      <div className="wrapper">
        <div className="flair flair--4b" />
      </div>
      <h4 className="absolute bottom-2 w-full text-center text-blue-800 font-medium text-sm pointer-events-none">
        Slide , Spin , Drag
      </h4>
    </div>
  );
};

export default PoWShowcase;
