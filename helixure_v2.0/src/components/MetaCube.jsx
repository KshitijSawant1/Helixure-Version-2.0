import React, { useRef, useEffect, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { ImprovedNoise } from "three/addons/math/ImprovedNoise.js";

const MetaCube = () => {
  const containerRef = useRef();
  const [unlockedScroll, setUnlockedScroll] = useState(false); // 🔓

  useEffect(() => {
    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#f3f8ff");

    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 100);
    const amount = 20;
    const initialZoom = amount * 2; // or try 3.0, 3.5 etc.

    camera.position.z = initialZoom;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    container.appendChild(renderer.domElement);
    renderer.domElement.style.pointerEvents = "none";

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.rotateSpeed = 0.25;
    controls.zoomSpeed = 0.25;
    controls.panSpeed = 0.25;

    const count = Math.pow(amount, 3);
    const dummy = new THREE.Object3D();
    const geometry = new THREE.BoxGeometry(0.7, 0.7, 0.7);
    const material = new THREE.MeshBasicMaterial();
    const mesh = new THREE.InstancedMesh(geometry, material, count);
    mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    scene.add(mesh);

    const offset = (amount - 1) / 2;
    const noise = new ImprovedNoise();
    const clr = new THREE.Color(0x0000ff);
    const nAmp = 0.1;
    const nScale = 3;

    dummy.userData.update = ({ i, x, y, z, time }) => {
      dummy.position.set(offset - x, offset - y, offset - z);
      const nz =
        noise.noise(time + x * nAmp, time + y * nAmp, time + z * nAmp) * nScale;
      dummy.scale.setScalar(nz);
      clr.setHSL(0.55 + nz * 0.1, 1.0, 0.4 + nz * 0.05);

      mesh.setColorAt(i, clr);
      mesh.instanceColor.needsUpdate = true;
    };
    let scrollZoom = camera.position.z;

    const handleScroll = () => {
      const scrollY = window.scrollY;

      // Get container boundaries
      const containerTop = container.offsetTop;
      const containerHeight = container.clientHeight;

      const scrollInSection = scrollY - containerTop;
      const scrollProgress = Math.min(
        Math.max(scrollInSection / containerHeight, 0),
        1
      ); // Clamp between 0–1

      // Zoom logic within 150vh height
      if (scrollProgress < 1) {
        scrollZoom = initialZoom - scrollProgress * amount;
      } else {
        scrollZoom = initialZoom - amount; // Final zoom level
      }
    };

    window.addEventListener("scroll", handleScroll);

    const animate = (t) => {
      const time = t * 0.0003;
      mesh.rotation.x = Math.sin(time * 0.25);
      mesh.rotation.y = Math.sin(time * 0.2);

      camera.position.z = scrollZoom;

      let i = 0;
      for (let x = 0; x < amount; x++) {
        for (let y = 0; y < amount; y++) {
          for (let z = 0; z < amount; z++) {
            dummy.userData.update({ i, x, y, z, time });
            dummy.updateMatrix();
            mesh.setMatrixAt(i, dummy.matrix);
            i++;
          }
        }
      }

      renderer.render(scene, camera);
      controls.update();
    };

    renderer.setAnimationLoop(animate);

    const handleResize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleScroll);
      container.removeChild(renderer.domElement);
    };
  }, [unlockedScroll]);

  return (
    <div style={{ position: "relative" }}>
      <div
        ref={containerRef}
        style={{
          position: "sticky",
          top: 0,
          width: "100%",
          height: "150vh",
          zIndex: 1,
          overflow: "hidden",
          pointerEvents: "none", // Allow scroll
        }}
      ></div>
    </div>
  );
};
export default MetaCube;

//<div
//  style={{
//    position: "absolute",
//   top: "50%",
//    left: "50%",
//    transform: "translate(-50%, -50%)",
//    fontSize: "8vw",
//    fontWeight: 900,
//    color: "#000",
//    zIndex: 10,
//    textShadow: "2px 2px 10px rgba(255,255,255,0.8)",
//    pointerEvents: "none", // No interference
//  }}
//>
//  Helixure
//</div>;
